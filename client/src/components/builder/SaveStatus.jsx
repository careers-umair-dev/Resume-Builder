import { useEffect, useState } from 'react';
import { AlertCircle, Check, Cloud, Loader2 } from 'lucide-react';
import { timeAgo } from '../../utils/date';

export default function SaveStatus({ status, savedAt, lastError, onRetry }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t); }, []);
  let node;
  if (status === 'saving') node = <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Saving…</>;
  else if (status === 'dirty') node = <><Cloud className="h-4 w-4" aria-hidden />Unsaved changes</>;
  else if (status === 'error') node = <><AlertCircle className="h-4 w-4 text-red-500" aria-hidden /><span className="text-red-600 dark:text-red-400" title={lastError}>Save failed</span><button type="button" onClick={onRetry} className="font-medium text-brand-600 hover:underline dark:text-brand-300">Retry</button></>;
  else node = <><Check className="h-4 w-4 text-emerald-600" aria-hidden />Saved{savedAt ? ` · ${timeAgo(savedAt)}` : ''}</>;
  return <div role="status" aria-live="polite" className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">{node}</div>;
}
