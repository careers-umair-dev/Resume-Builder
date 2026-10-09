import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContext = createContext(null);
export const NotificationsContext = createContext(null);

const STYLES = {
  success: { Icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400' },
  error: { Icon: AlertCircle, cls: 'text-red-600 dark:text-red-400' },
  info: { Icon: Info, cls: 'text-brand-600 dark:text-brand-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((type, message, duration = 4500) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    setHistory((h) => [{ id, type, message, at: Date.now(), read: false }, ...h].slice(0, 20));
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (m, d) => push('success', m, d),
    error: (m, d) => push('error', m, d ?? 6500),
    info: (m, d) => push('info', m, d),
    dismiss,
  }), [push, dismiss]);

  const notifications = useMemo(() => ({
    history, unread: history.filter((h) => !h.read).length,
    markAllRead: () => setHistory((h) => h.map((x) => ({ ...x, read: true }))),
    clear: () => setHistory([]),
  }), [history]);

  return (
    <ToastContext.Provider value={toast}>
      <NotificationsContext.Provider value={notifications}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end" role="region" aria-label="Notifications" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map(({ id, type, message }) => {
            const { Icon, cls } = STYLES[type];
            return (
              <motion.div
                key={id} layout role={type === 'error' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft dark:border-slate-700 dark:bg-slate-800"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} aria-hidden />
                <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">{message}</p>
                <button onClick={() => dismiss(id)} className="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Dismiss notification">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      </NotificationsContext.Provider>
    </ToastContext.Provider>
  );
}
