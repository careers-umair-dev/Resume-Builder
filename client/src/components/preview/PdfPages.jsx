import { useEffect, useRef } from 'react';

export const A4_CSS_WIDTH = 794; // 210mm at 96dpi
const RATIO = 841.89 / 595.28;

function PageCanvas({ doc, pageNumber, zoom }) {
  const ref = useRef(null);
  const cssW = A4_CSS_WIDTH * zoom;

  useEffect(() => {
    let cancelled = false; let task;
    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const base = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: (cssW / base.width) * dpr });
        const off = document.createElement('canvas');
        off.width = Math.floor(vp.width); off.height = Math.floor(vp.height);
        task = page.render({ canvasContext: off.getContext('2d'), viewport: vp });
        await task.promise;
        if (cancelled || !ref.current) return;
        const c = ref.current;
        if (c.width !== off.width || c.height !== off.height) { c.width = off.width; c.height = off.height; }
        c.getContext('2d').drawImage(off, 0, 0); // single swap, no blank flash between renders
      } catch { /* cancelled or destroyed doc */ }
    })();
    return () => { cancelled = true; task?.cancel(); };
  }, [doc, pageNumber, cssW]);

  return <canvas ref={ref} role="img" aria-label={`Resume page ${pageNumber}`} style={{ width: cssW, height: cssW * RATIO }} className="pdf-page block bg-white shadow-paper" />;
}

export default function PdfPages({ doc, zoom }) {
  return (
    <div className="pdf-pages flex flex-col items-center gap-6">
      {Array.from({ length: doc.numPages }, (_, i) => <PageCanvas key={i} doc={doc} pageNumber={i + 1} zoom={zoom} />)}
    </div>
  );
}
