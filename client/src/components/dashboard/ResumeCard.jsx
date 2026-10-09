import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Download, Eye, Loader2, Pencil, TextCursorInput, Trash2 } from 'lucide-react';
import TemplateThumb from '../common/TemplateThumb';
import CompletionRing from './CompletionRing';
import { TEMPLATES } from '../../constants/app';
import { fullDate, timeAgo } from '../../utils/date';

function IconBtn({ label, icon: Icon, onClick, busy, danger, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || busy} aria-label={label} title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${danger ? 'text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white'}`}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
    </button>
  );
}

const ResumeCard = forwardRef(function ResumeCard({ resume, view, busy, onView, onDuplicate, onDownload, onRename, onDelete }, ref) {
  const tpl = TEMPLATES.find((t) => t.id === resume.template) || TEMPLATES[0];
  const percent = resume.completion?.percent ?? 0;
  const color = resume.customization?.primaryColor || '#2563eb';
  const working = !!busy;
  const actions = (
    <div className="flex items-center gap-0.5">
      <IconBtn label="Preview PDF" icon={Eye} onClick={() => onView(resume)} busy={busy === 'view'} disabled={working} />
      <IconBtn label="Rename" icon={TextCursorInput} onClick={() => onRename(resume)} disabled={working} />
      <IconBtn label="Duplicate" icon={Copy} onClick={() => onDuplicate(resume)} busy={busy === 'duplicate'} disabled={working} />
      <IconBtn label="Download PDF" icon={Download} onClick={() => onDownload(resume)} busy={busy === 'download'} disabled={working} />
      <IconBtn label="Delete" icon={Trash2} onClick={() => onDelete(resume)} danger disabled={working} />
    </div>
  );
  const meta = (
    <p className="truncate text-xs text-slate-500 dark:text-slate-400" title={fullDate(resume.updatedAt)}>{tpl.name} · Updated {timeAgo(resume.updatedAt)}</p>
  );

  if (view === 'list') {
    return (
      <motion.li ref={ref} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card flex items-center gap-4 p-3 sm:p-4">
        <div className="hidden w-10 shrink-0 sm:block"><TemplateThumb variant={tpl.variant} color={color} className="!shadow-none" /></div>
        <div className="min-w-0 flex-1">
          <Link to={`/resumes/${resume._id}/edit`} className="block truncate font-medium hover:text-brand-600 dark:hover:text-brand-300">{resume.name}</Link>
          {meta}
        </div>
        <CompletionRing percent={percent} />
        <Link to={`/resumes/${resume._id}/edit`} className="hidden h-8 items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-sm font-medium text-brand-700 hover:bg-brand-100 md:inline-flex dark:bg-brand-900/30 dark:text-brand-200"><Pencil className="h-3.5 w-3.5" aria-hidden />Edit</Link>
        {actions}
      </motion.li>
    );
  }

  return (
    <motion.li ref={ref} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} whileHover={{ y: -2 }} className="card group flex flex-col overflow-hidden">
      <Link to={`/resumes/${resume._id}/edit`} className="flex justify-center bg-slate-100 px-10 pt-6 dark:bg-slate-800/60" aria-label={`Edit ${resume.name}`}>
        <div className="w-32 translate-y-0 transition-transform group-hover:-translate-y-1"><TemplateThumb variant={tpl.variant} color={color} className="rounded-b-none" /></div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/resumes/${resume._id}/edit`} className="block truncate font-semibold hover:text-brand-600 dark:hover:text-brand-300" title={resume.name}>{resume.name}</Link>
            {meta}
          </div>
          <CompletionRing percent={percent} />
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <Link to={`/resumes/${resume._id}/edit`} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700"><Pencil className="h-3.5 w-3.5" aria-hidden />Edit</Link>
          {actions}
        </div>
      </div>
    </motion.li>
  );
});

export default ResumeCard;
