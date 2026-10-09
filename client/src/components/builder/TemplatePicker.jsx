import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Eye, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import PdfPages from '../preview/PdfPages';
import { renderThumb } from '../preview/templateThumbs';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { SAMPLE_CONTENT } from '../../constants/builder';
import { TEMPLATES } from '../../constants/app';

const hasContent = (d) => ['experience', 'education', 'projects', 'skills'].some((k) => d[k]?.length);

function useSampleAware(draft) {
  return useMemo(() => {
    const { name, ...rest } = draft; // eslint-disable-line no-unused-vars
    if (hasContent(draft)) return { payload: rest, sample: false };
    const personalInfo = { fullName: 'Alex Morgan', title: 'Software Engineering Intern', email: 'alex@example.com', location: 'Remote', ...Object.fromEntries(Object.entries(draft.personalInfo || {}).filter(([, v]) => v)) };
    return { payload: { ...rest, ...SAMPLE_CONTENT, summary: draft.summary || SAMPLE_CONTENT.summary, personalInfo }, sample: true };
  }, [draft]);
}

function Thumb({ payload, template }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let off = false; setFailed(false);
    const t = setTimeout(() => renderThumb(payload, template).then((s) => !off && setSrc(s)).catch(() => !off && setFailed(true)), 60);
    return () => { off = true; clearTimeout(t); };
  }, [payload, template]);
  return (
    <div className="aspect-[1/1.414] w-full overflow-hidden rounded-md bg-white shadow-paper ring-1 ring-slate-200 dark:ring-slate-700">
      {src ? <img src={src} alt="" className="h-full w-full object-cover object-top" />
        : <div className="flex h-full items-center justify-center text-xs text-slate-400">{failed ? 'Preview unavailable' : <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading preview" />}</div>}
    </div>
  );
}

function FullPreview({ payload, template, onBack, onUse, isCurrent }) {
  const { doc, loading, error } = usePdfDocument({ ...payload, template }, { debounce: 0 });
  const tpl = TEMPLATES.find((t) => t.id === template);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300"><ArrowLeft className="h-4 w-4" aria-hidden />All templates</button>
        <div className="flex items-center gap-3"><span className="text-sm font-semibold">{tpl.name}</span><Button size="sm" onClick={onUse}>{isCurrent ? 'Keep this template' : 'Use this template'}</Button></div>
      </div>
      <div className="max-h-[68vh] overflow-auto rounded-xl bg-slate-100 p-4 dark:bg-slate-950">
        {doc ? <PdfPages doc={doc} zoom={0.9} /> : error ? <p role="alert" className="py-10 text-center text-sm text-red-600">{error}</p> : <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-label="Loading preview" /></div>}
        {loading && doc && <Loader2 className="mx-auto mt-3 h-4 w-4 animate-spin text-slate-400" aria-hidden />}
      </div>
    </div>
  );
}

export default function TemplatePicker({ open, onClose, draft, current, onSelect }) {
  const { payload, sample } = useSampleAware(draft);
  const [view, setView] = useState(null);
  useEffect(() => { if (open) setView(null); }, [open]);
  const choose = (id) => { onSelect(id); onClose(); };

  return (
    <Modal open={open} onClose={onClose} size="xl" title="Choose a template" description={sample ? 'Previewing with sample content. Your own details appear as you add them.' : 'Each preview uses your resume content and current design settings.'}>
      {view ? <FullPreview payload={payload} template={view} isCurrent={view === current} onBack={() => setView(null)} onUse={() => choose(view)} /> : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {TEMPLATES.map((t) => {
            const active = t.id === current;
            return (
              <li key={t.id}>
                <div className={`rounded-xl p-2 transition ${active ? 'bg-brand-50 ring-2 ring-brand-600 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                  <button type="button" onClick={() => choose(t.id)} className="relative block w-full text-left" aria-label={`Use ${t.name}`} aria-pressed={active}>
                    <Thumb payload={payload} template={t.id} />
                    {active && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white shadow"><Check className="h-4 w-4" aria-hidden /></span>}
                  </button>
                  <div className="mt-2 flex items-start justify-between gap-2 px-1">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{t.name}</p><p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.blurb}</p></div>
                    <button type="button" onClick={() => setView(t.id)} aria-label={`Full preview of ${t.name}`} title="Full preview" className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
