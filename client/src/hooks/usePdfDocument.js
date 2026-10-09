import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { previewService } from '../services/previewService';
import { getBufferErrorMessage } from '../utils/errors';

/** Renders `payload` on the server and loads the result in pdf.js. Keeps the previous doc until the next one is ready. */
export function usePdfDocument(payload, { debounce = 350, enabled = true } = {}) {
  const [state, setState] = useState({ doc: null, loading: true, error: '', empty: false });
  const [nonce, setNonce] = useState(0);
  const key = useMemo(() => JSON.stringify(payload), [payload]);
  const docRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const ctrl = new AbortController();
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    const t = setTimeout(async () => {
      try {
        const buf = await previewService.render(JSON.parse(key), ctrl.signal);
        const pdfjs = (await import('../lib/pdfjs')).default;
        const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
        if (cancelled) { doc.destroy(); return; }
        const old = docRef.current;
        docRef.current = doc;
        setState({ doc, loading: false, error: '', empty: false });
        if (old) setTimeout(() => old.destroy().catch(() => {}), 1500);
      } catch (err) {
        if (cancelled || axios.isCancel(err)) return;
        const message = await getBufferErrorMessage(err);
        setState((s) => ({ ...s, loading: false, error: message, empty: err.response?.status === 400 }));
      }
    }, debounce);
    return () => { cancelled = true; ctrl.abort(); clearTimeout(t); };
  }, [key, nonce, debounce, enabled]);

  useEffect(() => () => { docRef.current?.destroy().catch(() => {}); }, []);
  return { ...state, retry: useCallback(() => setNonce((n) => n + 1), []) };
}
