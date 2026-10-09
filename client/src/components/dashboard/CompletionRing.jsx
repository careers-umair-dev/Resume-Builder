export const completionTone = (p) => (p >= 80 ? '#059669' : p >= 50 ? '#2563eb' : p >= 25 ? '#d97706' : '#dc2626');

export default function CompletionRing({ percent = 0, size = 40 }) {
  const r = (size - 6) / 2; const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${percent}% complete`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4" strokeLinecap="round" stroke={completionTone(percent)} strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">{percent}</span>
    </div>
  );
}
