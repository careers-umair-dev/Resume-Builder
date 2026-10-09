import { forwardRef, useId, useState } from 'react';
import { Plus, X } from 'lucide-react';

const control = 'w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800';
const border = (err) => (err ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700');

function Wrap({ id, label, hideLabel, error, hint, right, className = '', children }) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-xs font-medium text-slate-600 dark:text-slate-300'}>{label}</label>
        {right}
      </div>
      {children}
      {error ? <p id={`${id}-msg`} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p> : hint ? <p id={`${id}-msg`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}
const described = (id, error, hint) => ({ 'aria-invalid': !!error || undefined, 'aria-describedby': error || hint ? `${id}-msg` : undefined });

export const TextInput = forwardRef(function TextInput({ label, hideLabel, error, hint, className, value, ...rest }, ref) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hideLabel={hideLabel} error={error} hint={hint} className={className}>
      <input id={id} ref={ref} value={value ?? ''} className={`${control} h-10 ${border(error)}`} {...described(id, error, hint)} {...rest} />
    </Wrap>
  );
});

export function TextArea({ label, error, hint, value = '', max, rows = 4, className, ...rest }) {
  const id = useId();
  const counter = max ? <span className={`text-xs tabular-nums ${value.length > max * 0.95 ? 'text-amber-600' : 'text-slate-400'}`}>{value.length}/{max}</span> : null;
  return (
    <Wrap id={id} label={label} error={error} hint={hint} right={counter} className={className}>
      <textarea id={id} rows={rows} value={value} maxLength={max} className={`${control} resize-y py-2 leading-relaxed ${border(error)}`} {...described(id, error, hint)} {...rest} />
    </Wrap>
  );
}

export function SelectInput({ label, hideLabel, options, value, onChange, placeholder = 'Select…', className }) {
  const id = useId();
  const list = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <Wrap id={id} label={label} hideLabel={hideLabel} className={className}>
      <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${control} h-10 ${border(false)}`}>
        <option value="">{placeholder}</option>
        {list.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Wrap>
  );
}

export function Toggle({ checked, onChange, label, className = '' }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 ${className}`}>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      {label && <span onClick={() => onChange(!checked)}>{label}</span>}
    </label>
  );
}

export function TagInput({ label, hideLabel, value = [], onChange, max = 30, tagMax = 40, placeholder = 'Type and press Enter', hint, className }) {
  const id = useId();
  const [text, setText] = useState('');
  const commit = (raw) => {
    const parts = raw.split(',').map((t) => t.trim().slice(0, tagMax)).filter(Boolean);
    const next = [...value];
    parts.forEach((t) => { if (next.length < max && !next.some((x) => x.toLowerCase() === t.toLowerCase())) next.push(t); });
    if (next.length !== value.length) onChange(next);
    setText('');
  };
  return (
    <Wrap id={id} label={label} hideLabel={hideLabel} hint={hint} className={className}>
      <div className={`flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-white p-1.5 focus-within:ring-2 focus-within:ring-brand-500 dark:bg-slate-900 ${border(false)}`}>
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-brand-50 py-0.5 pl-2 pr-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
            {t}<button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="rounded p-0.5 hover:bg-brand-100 dark:hover:bg-brand-800"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input id={id} value={text} onChange={(e) => (e.target.value.includes(',') ? commit(e.target.value) : setText(e.target.value))} disabled={value.length >= max}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(text); } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1)); }}
          onBlur={() => text && commit(text)} placeholder={value.length ? '' : placeholder} className="min-w-[8rem] flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-slate-400" />
      </div>
    </Wrap>
  );
}

export function BulletList({ label, value = [], onChange, max = 20, itemMax = 400 }) {
  const [focusIdx, setFocusIdx] = useState(-1);
  const set = (i, v) => onChange(value.map((x, k) => (k === i ? v : x)));
  const add = (at = value.length) => { if (value.length >= max) return; const next = [...value]; next.splice(at, 0, ''); onChange(next); setFocusIdx(at); };
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>
      <ul className="space-y-1.5">
        {value.map((b, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
            <input value={b} maxLength={itemMax} autoFocus={focusIdx === i} aria-label={`${label} ${i + 1}`} onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(i + 1); } }} className={`${control} h-9 ${border(false)}`} />
            <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Remove ${label} ${i + 1}`} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      {value.length < max && <button type="button" onClick={() => add()} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"><Plus className="h-3.5 w-3.5" />Add bullet</button>}
    </div>
  );
}
