import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Field = forwardRef(function Field({ label, error, hint, icon: Icon, type = 'text', className = '', ...rest }, ref) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" size={18} aria-hidden />}
        <input
          id={id} ref={ref} type={isPassword && shown ? 'text' : type}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={`h-11 w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-colors dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${Icon ? 'pl-10' : 'pl-3'} ${isPassword ? 'pr-11' : 'pr-3'} ${error ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'}`}
          {...rest}
        />
        {isPassword && (
          <button type="button" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
        : hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
});
export default Field;
