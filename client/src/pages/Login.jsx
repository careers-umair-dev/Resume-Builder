import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Field from '../components/forms/Field';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/errors';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      if (err.isNetworkError) toast.error(msg);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue building your resume."
      footer={<>New here? <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-300">Create an account</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{formError}</div>}
        <Field label="Email" type="email" icon={Mail} autoComplete="email" placeholder="you@example.com"
          error={errors.email?.message} {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />
        <Field label="Password" type="password" icon={Lock} autoComplete="current-password" placeholder="Your password"
          error={errors.password?.message} {...register('password', { required: 'Password is required' })} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>
    </AuthLayout>
  );
}
