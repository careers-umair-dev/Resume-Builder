import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Field from '../forms/Field';
import TemplateThumb from '../common/TemplateThumb';
import { TEMPLATES } from '../../constants/app';

export default function CreateResumeModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState(TEMPLATES[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setName(''); setTemplate(TEMPLATES[0].id); setError(''); setBusy(false); } }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim() || 'Untitled Resume';
    if (trimmed.length > 100) { setError('Name must be 100 characters or fewer'); return; }
    setBusy(true);
    try { await onCreate({ name: trimmed, template }); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title="Create a new resume" description="Choose a starting template. You can switch templates later." size="lg">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Resume name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="e.g. Frontend Intern Resume" maxLength={100} error={error} data-autofocus />
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Template</legend>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {TEMPLATES.map((t) => (
              <label key={t.id} className="cursor-pointer">
                <input type="radio" name="template" value={t.id} checked={template === t.id} onChange={() => setTemplate(t.id)} className="peer sr-only" />
                <span className="block rounded-lg p-1 ring-2 ring-transparent transition peer-checked:ring-brand-600 peer-focus-visible:ring-brand-400 hover:ring-slate-300 dark:hover:ring-slate-600">
                  <TemplateThumb variant={t.variant} />
                </span>
                <span className="mt-1 block text-center text-[11px] leading-tight text-slate-600 peer-checked:font-semibold dark:text-slate-400">{t.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" loading={busy}>Create resume</Button>
        </div>
      </form>
    </Modal>
  );
}
