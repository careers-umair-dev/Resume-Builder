import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, Minimize2, Printer, RotateCcw, Scan, ZoomIn, ZoomOut } from 'lucide-react';
import PdfPages, { A4_CSS_WIDTH } from './PdfPages';
import { usePdfDocument } from '../../hooks/usePdfDocument';

const MIN = 0.3; const MAX = 2.5; const STEP = 0.1;
const clamp = (z) => Math.min(MAX, Math.max(MIN, Math.round(z * 100) / 100));
const btn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800';

export default function LivePreview({ payload, pending }) {
  const { doc, loading, error, empty, retry } = usePdfDocument(payload);
  const boxRef = useRef(null);
  const scrollRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [mode, setMode] = useState('fit');
  const [manual, setManual] = useState(1);
  const [full, setFull] = useState(false);
  const [pseudo, setPseudo] = useState(false);

  useLayoutEffect(() => {
    const el = scrollRef.current; if (!el) return undefined;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el); setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const fit = clamp(Math.min(1.4, (width - (full || pseudo ? 64 : 32)) / A4_CSS_WIDTH) || 1);
  const zoom = mode === 'fit' ? fit : manual;
  const zoomBy = (d) => { setManual(clamp(zoom + d)); setMode('manual'); };

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  useEffect(() => {
    if (!pseudo) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setPseudo(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pseudo]);

  const toggleFull = useCallback(async () => {
    if (pseudo) { setPseudo(false); return; }
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    try { await boxRef.current.requestFullscreen(); } catch { setPseudo(true); }
  }, [pseudo]);

  const printResume = () => {
    document.body.classList.add('printing-resume');
    let fallback;
    const finish = () => {
      document.body.classList.remove('printing-resume');
      window.removeEventListener('afterprint', finish);
      window.clearTimeout(fallback);
    };
    window.addEventListener('afterprint', finish);
    fallback = window.setTimeout(finish, 30000);
    try {
      window.print();
    } catch (error) {
      finish();
      throw error;
    }
  };

  const isFull = full || pseudo;
  return (
    <div ref={boxRef} className={`print-preview-root flex h-full min-h-0 flex-col bg-slate-100 dark:bg-slate-950 ${pseudo ? 'fixed inset-0 z-[80]' : ''}`}>
      <div className="preview-toolbar flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
        <p className="flex items-center gap-2 text-sm font-medium">Preview
          {doc && <span className="text-xs font-normal text-slate-500">{doc.numPages} page{doc.numPages === 1 ? '' : 's'}</span>}
          {(loading || pending) && doc && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" aria-label="Updating preview" />}
        </p>
        <div className="flex items-center gap-0.5" role="toolbar" aria-label="Preview zoom">
          <button type="button" className={btn} onClick={() => zoomBy(-STEP)} disabled={zoom <= MIN} aria-label="Zoom out" title="Zoom out"><ZoomOut className="h-4 w-4" /></button>
          <button type="button" onClick={() => { setManual(1); setMode('manual'); }} className="h-8 min-w-[3.25rem] rounded-lg px-1 text-xs font-medium tabular-nums text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Reset zoom to 100%" title="Reset zoom"><RotateCcw className="mr-1 inline h-3 w-3" aria-hidden />{Math.round(zoom * 100)}%</button>
          <button type="button" className={btn} onClick={() => zoomBy(STEP)} disabled={zoom >= MAX} aria-label="Zoom in" title="Zoom in"><ZoomIn className="h-4 w-4" /></button>
          <button type="button" className={`${btn} ${mode === 'fit' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30' : ''}`} onClick={() => setMode('fit')} aria-label="Fit to screen" aria-pressed={mode === 'fit'} title="Fit to screen"><Scan className="h-4 w-4" /></button>
          <button type="button" className={btn} onClick={printResume} disabled={!doc || loading || pending} aria-label="Print resume" title="Print resume"><Printer className="h-4 w-4" /></button>
          <button type="button" className={btn} onClick={toggleFull} aria-label={isFull ? 'Exit fullscreen' : 'Fullscreen preview'} title={isFull ? 'Exit fullscreen (Esc)' : 'Fullscreen'}>{isFull ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
        </div>
      </div>
      <div ref={scrollRef} className="preview-scroll min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        {doc ? <div className="mx-auto w-fit"><PdfPages doc={doc} zoom={zoom} /></div>
          : error ? (
            <div role={empty ? 'status' : 'alert'} className="mx-auto mt-16 max-w-sm text-center text-sm text-slate-600 dark:text-slate-300">
              <p>{empty ? 'Start filling in your details to see your resume here.' : error}</p>
              {!empty && <button type="button" onClick={retry} className="mt-3 font-medium text-brand-600 hover:underline dark:text-brand-300">Try again</button>}
            </div>
          ) : <div className="mx-auto animate-pulse bg-white shadow-paper" style={{ width: A4_CSS_WIDTH * zoom, height: A4_CSS_WIDTH * zoom * 1.414 }} aria-label="Loading preview" role="status" />}
        {doc && error && <p role="alert" className="mt-4 text-center text-xs text-red-600">{error} <button type="button" onClick={retry} className="font-medium underline">Retry</button></p>}
      </div>
    </div>
  );
}
