import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, description, children, size = 'md', dismissible = true }) {
  const ref = useRef(null);
  const titleId = useId();
  const lastFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => { (ref.current?.querySelector('[data-autofocus]') || ref.current?.querySelector(FOCUSABLE))?.focus(); }, 30);
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) { e.stopPropagation(); onClose(); }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = [...ref.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; lastFocus.current?.focus?.(); };
  }, [open, onClose, dismissible]);

  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" onClick={dismissible ? onClose : undefined} aria-hidden />
          <motion.div
            ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.18 }}
            className={`relative max-h-[92vh] w-full ${width} overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-6 shadow-paper sm:rounded-2xl dark:border-slate-700 dark:bg-slate-900`}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
              </div>
              {dismissible && <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>}
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
