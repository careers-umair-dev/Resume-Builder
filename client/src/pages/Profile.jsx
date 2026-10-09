import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Mail, Trash2, User } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Field from '../components/forms/Field';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';
import { uploadService } from '../services/uploadService';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { MAX_PHOTO_SIZE } from '../constants/app';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting, isDirty } } = useForm({ defaultValues: { name: user.name, email: user.email } });

  const onSubmit = async (values) => {
    try {
      const updated = await authService.updateProfile(values);
      updateUser(updated); reset({ name: updated.name, email: updated.email });
      toast.success('Profile updated');
    } catch (err) {
      const fields = getFieldErrors(err).filter((f) => ['name', 'email'].includes(f.field));
      fields.forEach((f) => setError(f.field, { message: f.message }));
      if (err.response?.status === 409) setError('email', { message: getErrorMessage(err) });
      else if (!fields.length) toast.error(getErrorMessage(err));
    }
  };

  const setImage = async (profileImage) => {
    try { updateUser(await authService.updateProfile({ profileImage })); toast.success(profileImage ? 'Profile photo updated' : 'Profile photo removed'); } catch (err) { toast.error(getErrorMessage(err)); }
  };
  const pick = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) { toast.error('Please choose a JPG or PNG image.'); return; }
    if (file.size > MAX_PHOTO_SIZE) { toast.error('Image must be 5 MB or smaller.'); return; }
    setUploading(true);
    try { await setImage(await uploadService.photo(file)); } catch (err) { toast.error(getErrorMessage(err)); } finally { setUploading(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Profile</h1><p className="mt-1 text-slate-600 dark:text-slate-400">Manage how you appear in Resumify.</p></div>
      <section className="card p-6" aria-label="Profile photo">
        <div className="flex items-center gap-4">
          <Avatar user={user} size={72} />
          <div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>{user.profileImage ? 'Change photo' : 'Upload photo'}</Button>
              {user.profileImage && <Button variant="ghost" size="sm" onClick={() => setImage('')}><Trash2 className="h-4 w-4" aria-hidden />Remove</Button>}
            </div>
            <p className="mt-2 text-xs text-slate-500">JPG or PNG, up to 5 MB. This is your account photo, separate from the photo on a resume.</p>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pick} className="sr-only" tabIndex={-1} aria-label="Account photo file" />
          </div>
        </div>
      </section>
      <section className="card p-6" aria-label="Account details">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Full name" icon={User} autoComplete="name" error={errors.name?.message}
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' }, maxLength: { value: 80, message: 'Name is too long' } })} />
          <Field label="Email" type="email" icon={Mail} autoComplete="email" error={errors.email?.message}
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />
          <div className="flex justify-end"><Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button></div>
        </form>
      </section>
    </div>
  );
}
