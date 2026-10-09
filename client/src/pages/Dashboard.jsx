import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import InlineError from '../components/common/InlineError';
import StatsCards from '../components/dashboard/StatsCards';
import Toolbar from '../components/dashboard/Toolbar';
import ResumeCard from '../components/dashboard/ResumeCard';
import ResumeSkeleton from '../components/dashboard/ResumeSkeleton';
import EmptyState from '../components/dashboard/EmptyState';
import CreateResumeModal from '../components/dashboard/CreateResumeModal';
import RenameModal from '../components/dashboard/RenameModal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';
import { resumeService } from '../services/resumeService';
import { getBlobErrorMessage, getErrorMessage } from '../utils/errors';
import { saveBlob } from '../utils/files';

const VIEW_KEY = 'rb_view';
const PAGE_SIZE = 12;
const DEFAULTS = { q: '', template: '', sort: 'updated', page: 1 };

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [params, setParams] = useState(DEFAULTS);
  const [view, setView] = useState(() => { try { return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'; } catch { return 'grid'; } });
  const q = useDebounce(params.q.trim(), 300);

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const reqId = useRef(0);

  const loadList = useCallback(async () => {
    const id = ++reqId.current;
    setFetching(true);
    try {
      const res = await resumeService.list({ q: q || undefined, template: params.template || undefined, sort: params.sort, page: params.page, limit: PAGE_SIZE });
      if (id !== reqId.current) return;
      setData(res); setError('');
    } catch (err) {
      if (id !== reqId.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (id === reqId.current) setFetching(false);
    }
  }, [q, params.template, params.sort, params.page]);

  const loadStats = useCallback(async () => {
    try { setStats(await resumeService.stats()); } catch { setStats({ error: true }); }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { document.title = 'Dashboard — Resumify'; }, []);

  const change = (patch) => setParams((p) => ({ ...p, ...patch, page: patch.page ?? 1 }));
  const changeView = (v) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };
  const withBusy = async (id, action, fn) => {
    setBusy((b) => ({ ...b, [id]: action }));
    try { return await fn(); } finally { setBusy((b) => { const n = { ...b }; delete n[id]; return n; }); }
  };
  const refresh = () => Promise.all([loadList(), loadStats()]);

  const handleCreate = async ({ name, template }) => {
    try {
      const resume = await resumeService.create({ name, template });
      toast.success('Resume created');
      navigate(`/resumes/${resume._id}/edit`);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleView = (r) => withBusy(r._id, 'view', async () => {
    const tab = window.open('', '_blank');
    try {
      const { blob } = await resumeService.pdf(r._id, { inline: true });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url; else window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) { tab?.close(); toast.error(await getBlobErrorMessage(err)); }
  });

  const handleDownload = (r) => withBusy(r._id, 'download', async () => {
    try {
      const { blob, filename } = await resumeService.pdf(r._id);
      saveBlob(blob, filename);
      toast.success(`PDF generated: ${filename}`);
    } catch (err) { toast.error(await getBlobErrorMessage(err)); }
  });

  const handleDuplicate = (r) => withBusy(r._id, 'duplicate', async () => {
    try { await resumeService.duplicate(r._id); toast.success('Resume duplicated'); await refresh(); } catch (err) { toast.error(getErrorMessage(err)); }
  });

  const handleRename = async (r, name) => {
    try {
      await resumeService.update(r._id, { name });
      setData((d) => d && { ...d, resumes: d.resumes.map((x) => (x._id === r._id ? { ...x, name } : x)) });
      setRenaming(null); toast.success('Resume renamed'); loadStats();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleDelete = async () => {
    const r = deleting;
    try {
      await resumeService.remove(r._id);
      setDeleting(null); toast.success('Resume deleted');
      if (data.resumes.length === 1 && params.page > 1) change({ page: params.page - 1 }); else await refresh();
    } catch (err) { toast.error(getErrorMessage(err)); setDeleting(null); }
  };

  const filtered = !!(q || params.template);
  const noneAtAll = data && data.totalAll === 0;
  const first = user?.name?.split(' ')[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back{first ? `, ${first}` : ''}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Create, edit and export your resumes.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" aria-hidden />Create Resume</Button>
      </div>

      <StatsCards stats={stats} />

      <section aria-label="Your resumes" className="space-y-4">
        {!noneAtAll && <Toolbar params={params} onChange={change} view={view} onView={changeView} disabled={!data} />}

        {error && !data ? <InlineError message={error} onRetry={loadList} />
          : !data ? <ResumeSkeleton view={view} />
          : noneAtAll ? <EmptyState onCreate={() => setCreateOpen(true)} />
          : data.resumes.length === 0 ? <EmptyState filtered onClear={() => setParams(DEFAULTS)} />
          : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">{data.total} resume{data.total === 1 ? '' : 's'}{filtered ? ' found' : ''}</p>
              {error && <InlineError message={error} onRetry={loadList} />}
              <ul className={`${view === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'} transition-opacity ${fetching ? 'opacity-60' : ''}`}>
                <AnimatePresence mode="popLayout">
                  {data.resumes.map((r) => (
                    <ResumeCard key={r._id} resume={r} view={view} busy={busy[r._id]} onView={handleView} onDuplicate={handleDuplicate} onDownload={handleDownload} onRename={setRenaming} onDelete={setDeleting} />
                  ))}
                </AnimatePresence>
              </ul>
              {data.pages > 1 && (
                <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Pagination">
                  <Button variant="secondary" size="sm" onClick={() => change({ page: params.page - 1 })} disabled={params.page <= 1 || fetching} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Page {data.page} of {data.pages}</span>
                  <Button variant="secondary" size="sm" onClick={() => change({ page: params.page + 1 })} disabled={params.page >= data.pages || fetching} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
                </nav>
              )}
            </>
          )}
      </section>

      <CreateResumeModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <RenameModal resume={renaming} onClose={() => setRenaming(null)} onRename={handleRename} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete this resume?" confirmLabel="Delete resume"
        message={deleting ? `“${deleting.name}” will be permanently deleted. This can’t be undone.` : ''} />
    </div>
  );
}
