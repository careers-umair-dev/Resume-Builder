import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { TextInput } from './inputs';
import { PERSONAL_FIELDS } from '../../constants/builder';
import { normalizeUrl } from '../../utils/validate';
import { uploadService } from '../../services/uploadService';
import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { MAX_PHOTO_SIZE } from '../../constants/app';

export default function PersonalInfoForm({ value, errors, onField }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) { toast.error('Please choose a JPG or PNG image.'); return; }
    if (file.size > MAX_PHOTO_SIZE) { toast.error('Image must be 5 MB or smaller.'); return; }
    setUploading(true);
    try { onField('photo', await uploadService.photo(file)); toast.success('Photo uploaded'); } catch (err) { toast.error(getErrorMessage(err)); } finally { setUploading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          {value.photo ? <img src={assetUrl(value.photo)} alt="Profile" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" aria-hidden />}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800">
              {uploading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{value.photo ? 'Change photo' : 'Upload photo'}
            </button>
            {value.photo && <button type="button" onClick={() => onField('photo', '')} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" aria-hidden />Remove</button>}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Optional. JPG or PNG, up to 5 MB. Shown only on templates that include a photo.</p>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pick} className="sr-only" tabIndex={-1} aria-label="Profile photo file" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {PERSONAL_FIELDS.map((f) => (
          <TextInput key={f.key} label={f.label} className={f.half ? '' : 'sm:col-span-2'} type={f.url ? 'url' : f.type || 'text'} inputMode={f.url ? 'url' : undefined} autoComplete={f.autoComplete}
            placeholder={f.url ? 'https://' : f.placeholder} maxLength={f.max} value={value[f.key]} error={errors[`personalInfo.${f.key}`]}
            onChange={(e) => onField(f.key, e.target.value)} onBlur={f.url ? (e) => onField(f.key, normalizeUrl(e.target.value)) : undefined} />
        ))}
      </div>
    </div>
  );
}
