export default function ResumeSkeleton({ view, count = 6 }) {
  const items = Array.from({ length: count });
  if (view === 'list') {
    return <ul aria-hidden className="space-y-3">{items.map((_, i) => <li key={i} className="card flex animate-pulse items-center gap-4 p-4"><div className="h-12 w-9 rounded bg-slate-200 dark:bg-slate-700" /><div className="flex-1 space-y-2"><div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-700" /></div><div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" /></li>)}</ul>;
  }
  return (
    <ul aria-hidden className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((_, i) => (
        <li key={i} className="card animate-pulse overflow-hidden"><div className="flex h-44 justify-center bg-slate-100 pt-6 dark:bg-slate-800/60"><div className="h-full w-28 rounded-t bg-slate-200 dark:bg-slate-700" /></div>
          <div className="space-y-3 p-4"><div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-8 w-full rounded bg-slate-200 dark:bg-slate-700" /></div></li>
      ))}
    </ul>
  );
}
