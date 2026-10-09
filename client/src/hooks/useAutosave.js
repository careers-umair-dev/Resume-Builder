import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EDITABLE_KEYS } from '../constants/builder';
import { resumeService } from '../services/resumeService';
import { revertInvalid, validateResume } from '../utils/validate';
import { getErrorMessage } from '../utils/errors';

/**
 * Debounced autosave. Sends only the top-level keys that differ from the last saved snapshot.
 * Invalid fields are reverted to their last saved value in the payload (never block other edits).
 * status: saved | dirty | saving | error
 */
export function useAutosave({ id, draft, initialSaved, onSaved, delay = 1200 }) {
  const savedRef = useRef(initialSaved);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const inFlight = useRef(false);
  const flight = useRef(null);
  const timer = useRef(null);
  const retry = useRef(null);
  const saveRef = useRef(null);
  const [status, setStatus] = useState('saved');
  const [savedAt, setSavedAt] = useState(null);
  const [lastError, setLastError] = useState('');
  const errors = useMemo(() => validateResume(draft), [draft]);

  const diff = useCallback(() => {
    const safe = revertInvalid(draftRef.current, savedRef.current, validateResume(draftRef.current));
    const changed = {};
    EDITABLE_KEYS.forEach((k) => { if (JSON.stringify(safe[k]) !== JSON.stringify(savedRef.current[k])) changed[k] = safe[k]; });
    return { changed, safe };
  }, []);

  const run = useCallback(async () => {
    const { changed, safe } = diff();
    const keys = Object.keys(changed);
    if (!keys.length) { setStatus('saved'); return true; }
    inFlight.current = true; setStatus('saving');
    try {
      const res = await resumeService.update(id, changed);
      keys.forEach((k) => { savedRef.current = { ...savedRef.current, [k]: safe[k] }; });
      onSaved(res); setSavedAt(Date.now()); setLastError('');
      inFlight.current = false;
      if (Object.keys(diff().changed).length) { setStatus('dirty'); timer.current = setTimeout(() => saveRef.current(), 400); } else setStatus('saved');
      return true;
    } catch (err) {
      inFlight.current = false; setStatus('error'); setLastError(getErrorMessage(err));
      retry.current = setTimeout(() => saveRef.current(), 10000);
      return false;
    }
  }, [id, diff, onSaved]);
  const save = useCallback(() => {
    clearTimeout(timer.current); clearTimeout(retry.current);
    if (inFlight.current) return flight.current;
    flight.current = run();
    return flight.current;
  }, [run]);

  saveRef.current = save;

  useEffect(() => {
    if (Object.keys(diff().changed).length) {
      if (!inFlight.current) setStatus((s) => (s === 'error' ? s : 'dirty'));
      clearTimeout(timer.current);
      timer.current = setTimeout(() => saveRef.current(), delay);
    } else if (!inFlight.current) setStatus('saved');
    return () => clearTimeout(timer.current);
  }, [draft, delay, diff]);

  useEffect(() => {
    const warn = (e) => { if (inFlight.current || Object.keys(diff().changed).length) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [diff]);

  // best-effort flush when leaving the editor
  useEffect(() => () => { clearTimeout(retry.current); if (Object.keys(diff().changed).length) saveRef.current(); }, [diff]);

  // what the preview should show: current draft with invalid fields held at their last saved value
  const safeDraft = useMemo(() => revertInvalid(draft, savedRef.current, errors), [draft, errors, savedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, savedAt, lastError, errors, save, safeDraft };
}
