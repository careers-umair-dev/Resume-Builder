import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Field from '../forms/Field';

export default function RenameModal({ resume, onClose, onRename }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (resume) { setName(resume.name); setError(''); setBusy(false); } }, [resume]);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Name is required'); return; }
    if (trimmed === resume.name) { onClose(); return; }
    setBusy(true);
    try { await onRename(resume, trimmed); } finally { setBusy(false); }
  };

  return (
    <Modal open={!!resume} onClose={busy ? () => {} : onClose} title="Rename resume" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Resume name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} maxLength={100} error={error} data-autofocus />
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" loading={busy}>Save</Button></div>
      </form>
    </Modal>
  );
}
