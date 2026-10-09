import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function InlineError({ message, onRetry }) {
  return (
    <div role="alert" className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300"><AlertCircle className="h-6 w-6" aria-hidden /></div>
      <h2 className="font-semibold">Couldn’t load your resumes</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">{message}</p>
      {onRetry && <Button variant="secondary" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
