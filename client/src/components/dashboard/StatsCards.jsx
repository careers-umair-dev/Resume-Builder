import { Link } from 'react-router-dom';
import { CalendarClock, FileText, Gauge } from 'lucide-react';
import { timeAgo } from '../../utils/date';

function Stat({ icon: Icon, label, value, loading }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"><Icon className="h-5 w-5" aria-hidden /></div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {loading ? <div className="mt-1 h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : <p className="text-xl font-semibold">{value}</p>}
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  const loading = !stats;
  const failed = !!stats?.error;
  const v = (x) => (failed ? '—' : x);
  return (
    <section aria-label="Overview" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={FileText} label="Total resumes" value={v(stats?.total)} loading={loading} />
        <Stat icon={Gauge} label="Average completion" value={v(`${stats?.avgCompletion ?? 0}%`)} loading={loading} />
        <Stat icon={CalendarClock} label="Last updated" value={v(timeAgo(stats?.lastUpdated))} loading={loading} />
      </div>
      {stats?.recent?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Recently edited:</span>
          {stats.recent.map((r) => (
            <Link key={r._id} to={`/resumes/${r._id}/edit`} className="max-w-[14rem] truncate rounded-full border border-slate-200 bg-white px-3 py-1 font-medium hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-brand-300" title={r.name}>{r.name}</Link>
          ))}
        </div>
      )}
    </section>
  );
}
