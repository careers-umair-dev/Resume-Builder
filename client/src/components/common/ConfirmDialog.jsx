import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const run = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title} size="sm">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300"><TriangleAlert className="h-5 w-5" aria-hidden /></div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={busy} data-autofocus>Cancel</Button>
        <Button variant="danger" onClick={run} loading={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
