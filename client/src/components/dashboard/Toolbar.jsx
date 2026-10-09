import { LayoutGrid, List, Search, X } from 'lucide-react';
import { TEMPLATES } from '../../constants/app';

const sel = 'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900';

export default function Toolbar({ params, onChange, view, onView, disabled }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input type="search" value={params.q} onChange={(e) => onChange({ q: e.target.value })} placeholder="Search resumes by name" aria-label="Search resumes"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900" />
        {params.q && <button type="button" onClick={() => onChange({ q: '' })} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Filter by template" className={sel} value={params.template} onChange={(e) => onChange({ template: e.target.value })}>
          <option value="">All templates</option>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select aria-label="Sort resumes" className={sel} value={params.sort} onChange={(e) => onChange({ sort: e.target.value })}>
          <option value="updated">Last updated</option>
          <option value="created">Newest created</option>
          <option value="name">Name (A–Z)</option>
          <option value="completion">Completion</option>
        </select>
        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700" role="group" aria-label="View mode">
          {[['grid', LayoutGrid, 'Grid view'], ['list', List, 'List view']].map(([k, Icon, label]) => (
            <button key={k} type="button" onClick={() => onView(k)} aria-label={label} aria-pressed={view === k} disabled={disabled}
              className={`flex h-8 w-8 items-center justify-center rounded-md ${view === k ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Icon className="h-4 w-4" /></button>
          ))}
        </div>
      </div>
    </div>
  );
}
