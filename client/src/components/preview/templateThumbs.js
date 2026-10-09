import { previewService } from '../../services/previewService';

const cache = new Map(); // key -> Promise<dataUrl>

/** Renders page 1 of `payload` with the given template to a small JPEG data URL (cached). */
export function renderThumb(payload, template, width = 240) {
  const key = `${width}:${template}:${JSON.stringify(payload)}`;
  if (cache.has(key)) return cache.get(key);
  const p = (async () => {
    const buf = await previewService.render({ ...payload, template });
    const pdfjs = (await import('../../lib/pdfjs')).default;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
    try {
      const page = await doc.getPage(1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: (width / base.width) * dpr });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      return canvas.toDataURL('image/jpeg', 0.86);
    } finally { doc.destroy(); }
  })();
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  if (cache.size > 40) cache.delete(cache.keys().next().value);
  return p;
}
