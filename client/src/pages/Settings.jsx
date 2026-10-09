import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Lock, Moon, Sun } from 'lucide-react';
import Button from '../components/common/Button';
import Field from '../components/forms/Field';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';
import { resumeService } from '../services/resumeService';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { fullDate, timeAgo } from '../utils/date';
import { TEMPLATES } from '../constants/app';

function PasswordForm() {
  const { applySession } = useAuth();
  const toast = useToast();
  const { register, handleSubmit, watch, setError, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });
  const next = watch('newPassword');
  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      applySession(await authService.changePassword({ currentPassword, newPassword })); // server issues a fresh token and retires old ones
      reset(); toast.success('Password changed');
    } catch (err) {
      const fields = getFieldErrors(err).filter((f) => f.field === 'newPassword' || f.field === 'currentPassword');
      fields.forEach((f) => setError(f.field, { message: f.message }));
      if (!fields.length) {
        const msg = getErrorMessage(err);
        if (/current password/i.test(msg)) setError('currentPassword', { message: msg });
        else if (/different/i.test(msg)) setError('newPassword', { message: msg });
        else toast.error(msg);
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field label="Current password" type="password" icon={Lock} autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword', { required: 'Current password is required' })} />
      <Field label="New password" type="password" icon={Lock} autoComplete="new-password" hint="At least 8 characters, with a letter and a number." error={errors.newPassword?.message}
        {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'At least 8 characters' }, validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Include a letter and a number' })} />
      <Field label="Confirm new password" type="password" icon={Lock} autoComplete="new-password" error={errors.confirm?.message}
        {...register('confirm', { required: 'Please confirm your new password', validate: (v) => v === next || 'Passwords do not match' })} />
      <div className="flex justify-end"><Button type="submit" loading={isSubmitting}>Change password</Button></div>
    </form>
  );
}

function Downloads() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { resumeService.downloads().then(setRows).catch((e) => setError(getErrorMessage(e))); }, []);
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!rows) return <div className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" aria-label="Loading downloads" role="status" />;
  if (!rows.length) return <p className="text-sm text-slate-500 dark:text-slate-400">No downloads yet. PDFs you download will be listed here.</p>;
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {rows.map((r, i) => (
        <li key={`${r._id}-${r.at}-${i}`} className="flex items-center gap-3 py-2.5 text-sm">
          <Download className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
          <span className="hidden text-slate-500 sm:inline">{TEMPLATES.find((t) => t.id === r.template)?.name || r.template}</span>
          <span className="text-xs text-slate-500" title={fullDate(r.at)}>{timeAgo(r.at)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Settings() {
  const { theme, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Settings</h1><p className="mt-1 text-slate-600 dark:text-slate-400">Appearance, security and activity.</p></div>
      <section className="card p-6" aria-labelledby="appearance"><h2 id="appearance" className="mb-3 font-semibold">Appearance</h2>
        <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
          {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([k, Icon, l]) => (
            <button key={k} type="button" role="radio" aria-checked={theme === k} onClick={() => theme !== k && toggle()} className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium ${theme === k ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon className="h-4 w-4" aria-hidden />{l}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Only affects the app. Exported PDFs are always print-ready.</p>
      </section>
      <section className="card p-6" aria-labelledby="password"><h2 id="password" className="mb-4 font-semibold">Change password</h2><PasswordForm /></section>
      <section className="card p-6" aria-labelledby="downloads"><h2 id="downloads" className="mb-3 font-semibold">Recent downloads</h2><Downloads /></section>
    </div>
  );
}
