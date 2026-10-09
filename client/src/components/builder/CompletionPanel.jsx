import CompletionRing from '../dashboard/CompletionRing';

export default function CompletionPanel({ completion }) {
  const percent = completion?.percent ?? 0;
  const tips = completion?.suggestions || [];
  return (
    <div className="card flex gap-4 p-4">
      <CompletionRing percent={percent} size={56} />
      <div className="min-w-0">
        <p className="font-semibold">Resume Completion: {percent}%</p>
        {tips.length ? <ul className="mt-1 space-y-0.5 text-sm text-slate-600 dark:text-slate-400">{tips.slice(0, 3).map((t) => <li key={t}>• {t}</li>)}</ul>
          : <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Everything important is filled in. Nice work.</p>}
      </div>
    </div>
  );
}
