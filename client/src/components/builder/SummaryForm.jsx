import { TextArea } from './inputs';
import { SUMMARY_SUGGESTIONS } from '../../constants/builder';

export default function SummaryForm({ value, onChange }) {
  const len = value.trim().length;
  const hint = len === 0 ? 'Aim for 2–4 sentences (about 200–400 characters): who you are, what you build, and what you’re looking for.'
    : len < 100 ? 'A little short. Add what you build and what you want to do next.' : len > 600 ? 'Getting long. Shorter summaries are easier to skim.' : 'Good length.';
  return (
    <div className="space-y-3">
      <TextArea label="Summary" rows={6} max={1500} value={value} onChange={(e) => onChange(e.target.value)} hint={hint} placeholder="Write a short professional summary…" />
      <details className="group rounded-lg border border-slate-200 dark:border-slate-700">
        <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Need a starting point? Browse examples</summary>
        <ul className="space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
          {SUMMARY_SUGGESTIONS.map((s) => (
            <li key={s} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
              {s}
              <button type="button" onClick={() => onChange(s)} className="mt-2 block text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">Use this and edit it</button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
