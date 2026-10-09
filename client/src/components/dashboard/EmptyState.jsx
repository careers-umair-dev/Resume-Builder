import { FilePlus2, SearchX } from 'lucide-react';
import Button from '../common/Button';

export default function EmptyState({ filtered, onCreate, onClear }) {
  const Icon = filtered ? SearchX : FilePlus2;
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"><Icon className="h-7 w-7" aria-hidden /></div>
      <h2 className="text-lg font-semibold">{filtered ? 'No resumes match your filters' : 'Create your first resume'}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-slate-600 dark:text-slate-400">{filtered ? 'Try a different search or clear the filters.' : 'Pick a template and start building. You can change the design at any time.'}</p>
      <div className="mt-6">{filtered ? <Button variant="secondary" onClick={onClear}>Clear filters</Button> : <Button onClick={onCreate}><FilePlus2 className="h-4 w-4" aria-hidden />Create Resume</Button>}</div>
    </div>
  );
}
