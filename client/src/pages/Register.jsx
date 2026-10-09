import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Check, Lock, Mail, User } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Field from '../components/forms/Field';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

const RULES = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Contains a letter', test: (v) => /[A-Za-z]/.test(v) },
  { label: 'Contains a number', test: (v) => /\d/.test(v) },
];

export default function Register() {
  const { register: signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: '', email: '', password: '', confirm: '' } });
  const password = watch('password') || '';

  const onSubmit = async ({ name, email, password: pw }) => {
    setFormError('');
    try {
      const user = await signUp({ name, email, password: pw });
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err).filter((f) => ['name', 'email', 'password'].includes(f.field));
      fields.forEach((f) => setError(f.field, { message: f.message }));
      if (err.response?.status === 409) setError('email', { message: getErrorMessage(err) });
      else if (!fields.length) setFormError(getErrorMessage(err));
      if (err.isNetworkError) toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start building a professional resume in minutes."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-300">Log in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{formError}</div>}
        <Field label="Full name" icon={User} autoComplete="name" placeholder="Your name" error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' }, maxLength: { value: 80, message: 'Name is too long' } })} />
        <Field label="Email" type="email" icon={Mail} autoComplete="email" placeholder="you@example.com" error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />
        <div>
          <Field label="Password" type="password" icon={Lock} autoComplete="new-password" placeholder="Create a password" error={errors.password?.message}
            {...register('password', { required: 'Password is required', validate: (v) => RULES.every((r) => r.test(v)) || 'Password does not meet the requirements' })} />
          <ul className="mt-2 grid gap-1" aria-label="Password requirements">
            {RULES.map((r) => { const ok = r.test(password); return (
              <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <Check className={`h-3.5 w-3.5 ${ok ? '' : 'opacity-30'}`} aria-hidden />{r.label}<span className="sr-only">{ok ? ' (met)' : ' (not met)'}</span>
              </li>); })}
          </ul>
        </div>
        <Field label="Confirm password" type="password" icon={Lock} autoComplete="new-password" placeholder="Repeat your password" error={errors.confirm?.message}
          {...register('confirm', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' })} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>
    </AuthLayout>
  );
}
