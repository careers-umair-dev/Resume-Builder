import { Loader2 } from 'lucide-react';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400" role="status">
      <Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
