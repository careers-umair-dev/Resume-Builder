import { useCallback, useRef, useState } from 'react';

/** Undo/redo with coalescing: consecutive edits with the same key within 1s share one undo step. */
export function useHistory(initial, limit = 100) {
  const [s, setS] = useState({ past: [], present: initial, future: [] });
  const last = useRef({ key: null, at: 0 });

  const set = useCallback((updater, key) => {
    const now = Date.now();
    const coalesce = !!key && key === last.current.key && now - last.current.at < 1000;
    last.current = { key: key || null, at: now };
    setS((cur) => {
      const next = typeof updater === 'function' ? updater(cur.present) : updater;
      if (next === cur.present) return cur;
      return { past: coalesce ? cur.past : [...cur.past, cur.present].slice(-limit), present: next, future: [] };
    });
  }, [limit]);

  const undo = useCallback(() => { last.current = { key: null, at: 0 }; setS((c) => (c.past.length ? { past: c.past.slice(0, -1), present: c.past[c.past.length - 1], future: [c.present, ...c.future] } : c)); }, []);
  const redo = useCallback(() => { last.current = { key: null, at: 0 }; setS((c) => (c.future.length ? { past: [...c.past, c.present], present: c.future[0], future: c.future.slice(1) } : c)); }, []);

  return { state: s.present, set, undo, redo, canUndo: s.past.length > 0, canRedo: s.future.length > 0 };
}
