import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Loader2, PencilLine, Redo2, Save, Undo2, TriangleAlert } from 'lucide-react';
import PageLoader from '../components/common/PageLoader';
import InlineError from '../components/common/InlineError';
import ThemeToggle from '../components/common/ThemeToggle';
import SectionCard from '../components/builder/SectionCard';
import PersonalInfoForm from '../components/builder/PersonalInfoForm';
import SummaryForm from '../components/builder/SummaryForm';
import SkillsForm from '../components/builder/SkillsForm';
import EntryListEditor from '../components/builder/EntryListEditor';
import SectionsManager from '../components/builder/SectionsManager';
import CompletionPanel from '../components/builder/CompletionPanel';
import SaveStatus from '../components/builder/SaveStatus';
import DesignPanel from '../components/builder/DesignPanel';
import TemplatePicker from '../components/builder/TemplatePicker';

const LivePreview = lazy(() => import('../components/preview/LivePreview'));
import { TagInput } from '../components/builder/inputs';
import { EDITABLE_KEYS, PERSONAL_ICON, PRESETS, SECTION_META } from '../constants/builder';
import { useHistory } from '../hooks/useHistory';
import { useAutosave } from '../hooks/useAutosave';
import { useToast } from '../hooks/useToast';
import { resumeService } from '../services/resumeService';
import { getBlobErrorMessage, getErrorMessage } from '../utils/errors';
import { saveBlob } from '../utils/files';

const toDraft = (r) => Object.fromEntries(EDITABLE_KEYS.map((k) => [k, JSON.parse(JSON.stringify(r[k] ?? (['summary', 'name', 'template'].includes(k) ? '' : ['personalInfo', 'customization'].includes(k) ? {} : [])))]));
const iconBtn = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800';

function Workspace({ resume }) {
  const toast = useToast();
  const initial = useMemo(() => toDraft(resume), []); // eslint-disable-line react-hooks/exhaustive-deps
  const { state: draft, set, undo, redo, canUndo, canRedo } = useHistory(initial);
  const [meta, setMeta] = useState({ completion: resume.completion, updatedAt: resume.updatedAt });
  const onSaved = useCallback((res) => setMeta({ completion: res.completion, updatedAt: res.updatedAt }), []);
  const { status, savedAt, lastError, errors, save, safeDraft } = useAutosave({ id: resume._id, draft, initialSaved: initial, onSaved });
  const [open, setOpen] = useState({ personal: true });
  const [tab, setTab] = useState('editor');
  const [panel, setPanel] = useState('content');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const setField = useCallback((key, value, ck) => set((d) => ({ ...d, [key]: value }), ck || key), [set]);
  const setPersonal = useCallback((f, v) => set((d) => ({ ...d, personalInfo: { ...d.personalInfo, [f]: v } }), `personal.${f}`), [set]);
  const setCustom = useCallback((patch) => set((d) => ({ ...d, customization: { ...d.customization, ...patch, preset: 'custom' } }), `custom.${Object.keys(patch).join(',')}`), [set]);
  const applyPreset = useCallback((p) => set((d) => ({ ...d, customization: { ...p.values, preset: p.id } }), 'preset'), [set]);
  const resetCustom = useCallback(() => { set((d) => ({ ...d, customization: { ...PRESETS[0].values } }), 'reset'); toast.info('Customization reset'); }, [set, toast]);
  const previewPayload = useMemo(() => { const { name, ...rest } = safeDraft; return rest; }, [safeDraft]); // eslint-disable-line no-unused-vars
  const enabled = useMemo(() => new Set(draft.enabledSections), [draft.enabledSections]);
  const visible = draft.sectionOrder.filter((k) => enabled.has(k));
  const toggleOpen = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const jump = (k) => { setPanel('content'); setOpen((o) => ({ ...o, [k]: true })); setTab('editor'); setTimeout(() => document.getElementById(`section-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); };
  const toggleSection = (k) => { const on = enabled.has(k); setField('enabledSections', on ? draft.enabledSections.filter((x) => x !== k) : [...draft.enabledSections, k]); if (!on) setOpen((o) => ({ ...o, [k]: true })); };

  useEffect(() => { document.title = `${draft.name || 'Resume'} — Resumify`; }, [draft.name]);
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey; if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 's') { e.preventDefault(); save(); return; }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return; // keep native text undo inside fields
      if (k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); } else if (k === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, undo, redo]);

  const download = async () => {
    setDownloading(true);
    try {
      await save(); const ok = await save();
      if (!ok) { toast.error('Could not save your latest changes, so the PDF was not generated.'); return; }
      const { blob, filename } = await resumeService.pdf(resume._id);
      saveBlob(blob, filename); toast.success(`PDF generated: ${filename}`);
    } catch (err) { toast.error(await getBlobErrorMessage(err)); } finally { setDownloading(false); }
  };

  const errorCount = Object.keys(errors).length;
  const renderBody = (key) => {
    if (key === 'summary') return <SummaryForm value={draft.summary} onChange={(v) => setField('summary', v)} />;
    if (key === 'skills') return <SkillsForm items={draft.skills} onChange={(v, ck) => setField('skills', v, ck)} />;
    if (key === 'interests') return <TagInput label="Interests" value={draft.interests} max={40} tagMax={80} placeholder="e.g. Open source, Chess — press Enter" onChange={(v) => setField('interests', v)} />;
    return <EntryListEditor section={key} items={draft[key]} errors={errors} onChange={(v, ck) => setField(key, v, ck)} />;
  };
  const badge = (key) => (key === 'summary' ? (draft.summary.trim() ? `${draft.summary.trim().length} chars` : '') : draft[key]?.length || '');

  return (
    <div className="flex h-screen flex-col">
      <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 sm:gap-3 sm:px-4">
        <Link to="/dashboard" className={iconBtn} aria-label="Back to dashboard" title="Back to dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="min-w-0 flex-1 sm:flex-none">
          <label htmlFor="resume-name" className="sr-only">Resume name</label>
          <input id="resume-name" value={draft.name} maxLength={100} onChange={(e) => setField('name', e.target.value)} aria-invalid={!!errors.name || undefined}
            className={`w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold hover:border-slate-300 focus:border-slate-300 sm:w-64 dark:hover:border-slate-700 ${errors.name ? '!border-red-400' : ''}`} />
        </div>
        <div className="hidden sm:block"><SaveStatus status={status} savedAt={savedAt} lastError={lastError} onRetry={save} /></div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={undo} disabled={!canUndo} className={iconBtn} aria-label="Undo" title="Undo (Ctrl+Z)"><Undo2 className="h-4 w-4" /></button>
          <button type="button" onClick={redo} disabled={!canRedo} className={iconBtn} aria-label="Redo" title="Redo (Ctrl+Shift+Z)"><Redo2 className="h-4 w-4" /></button>
          <button type="button" onClick={save} disabled={status === 'saving' || status === 'saved'} className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 sm:inline-flex dark:border-slate-700 dark:hover:bg-slate-800" title="Save now (Ctrl+S)"><Save className="h-4 w-4" aria-hidden />Save now</button>
          <button type="button" onClick={download} disabled={downloading} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}<span className="hidden sm:inline">Download PDF</span><span className="sm:hidden">PDF</span>
          </button>
          <ThemeToggle className="hidden sm:inline-flex" />
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        <div role="tablist" aria-label="Editor or preview" className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
          {[['editor', PencilLine, 'Editor'], ['preview', Eye, 'Preview']].map(([k, Icon, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium ${tab === k ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500'}`}><Icon className="h-4 w-4" aria-hidden />{l}</button>
          ))}
        </div>
        <SaveStatus status={status} savedAt={savedAt} lastError={lastError} onRetry={save} />
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(440px,540px)_1fr]">
        <div className={`${tab === 'editor' ? 'block' : 'hidden'} min-h-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 lg:block`}>
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div role="tablist" aria-label="Editor panels" className="flex gap-1 px-3 pt-2">
              {[['content', 'Content'], ['design', 'Design']].map(([k, l]) => (
                <button key={k} role="tab" aria-selected={panel === k} onClick={() => setPanel(k)} className={`rounded-t-lg px-4 py-1.5 text-sm font-medium ${panel === k ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{l}</button>
              ))}
            </div>
            {panel === 'content' && (
              <nav aria-label="Jump to section" className="flex gap-1.5 overflow-x-auto bg-white px-3 py-2 dark:bg-slate-900">
                {['personal', ...visible].map((k) => (
                  <button key={k} type="button" onClick={() => jump(k)} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {k === 'personal' ? 'Personal' : SECTION_META[k].label.replace('Professional ', '').replace(' Experience', '')}
                  </button>
                ))}
              </nav>
            )}
          </div>
          {panel === 'design' ? (
            <div className="p-3 sm:p-4"><DesignPanel draft={draft} onTemplate={{ open: () => setPickerOpen(true) }} onCustom={setCustom} onPreset={applyPreset} onReset={resetCustom} /></div>
          ) : (
          <div className="space-y-3 p-3 sm:p-4">
            <CompletionPanel completion={meta.completion} />
            {errorCount > 0 && (
              <div role="alert" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{errorCount} field{errorCount === 1 ? '' : 's'} need{errorCount === 1 ? 's' : ''} attention. Invalid values are kept here but not saved until you fix them.</p>
              </div>
            )}
            <SectionCard id="personal" title="Personal Information" icon={PERSONAL_ICON} open={!!open.personal} onToggle={() => toggleOpen('personal')}>
              <PersonalInfoForm value={draft.personalInfo} errors={errors} onField={setPersonal} />
            </SectionCard>
            {visible.map((k) => (
              <SectionCard key={k} id={k} title={SECTION_META[k].label} icon={SECTION_META[k].icon} badge={badge(k)} open={!!open[k]} onToggle={() => toggleOpen(k)}>{renderBody(k)}</SectionCard>
            ))}
            <SectionCard id="manage" title="Manage Sections" icon={SECTION_META.skills.icon} open={!!open.manage} onToggle={() => toggleOpen('manage')}>
              <SectionsManager order={draft.sectionOrder} enabled={enabled} onReorder={(v) => setField('sectionOrder', v)} onToggle={toggleSection} />
            </SectionCard>
            <p className="pb-6 text-center text-xs text-slate-400">Changes save automatically. Ctrl+S saves immediately.</p>
          </div>
          )}
        </div>
        <div className={`${tab === 'preview' ? 'block' : 'hidden'} min-h-0 border-l border-slate-200 dark:border-slate-800 lg:block`}>
          <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-label="Loading preview" /></div>}>
            <LivePreview payload={previewPayload} pending={status === 'dirty' || status === 'saving'} />
          </Suspense>
        </div>
      </div>
      <TemplatePicker open={pickerOpen} onClose={() => setPickerOpen(false)} draft={safeDraft} current={draft.template} onSelect={(id) => { setField('template', id); toast.success('Template changed'); }} />
    </div>
  );
}

export default function ResumeBuilder() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const load = useCallback(() => {
    setError(''); setResume(null);
    resumeService.get(id).then(setResume).catch((err) => { if ([400, 404].includes(err.response?.status)) setNotFound(true); else setError(getErrorMessage(err)); });
  }, [id]);
  useEffect(load, [load]);
  if (notFound) return <Navigate to="/404" replace />;
  if (error) return <div className="container-page py-16"><InlineError message={error} onRetry={load} /></div>;
  if (!resume) return <PageLoader label="Loading resume…" />;
  return <Workspace key={resume._id} resume={resume} />;
}
