import { useEffect } from 'react';

/** Calls onDismiss on outside mousedown or Escape while `active`. */
export function useDismiss(ref, active, onDismiss) {
  useEffect(() => {
    if (!active) return undefined;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) onDismiss(); };
    const key = (e) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [ref, active, onDismiss]);
}
