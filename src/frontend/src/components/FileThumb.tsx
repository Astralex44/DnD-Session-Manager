import { useEffect, useState } from 'react';

// Rendered first pages, by file URL — panels refetch on every live event, and
// a PDF shouldn't be downloaded and drawn again each time.
const pdfThumbCache = new Map<string, Promise<string | null>>();

function isImageFile(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(url);
}

// First page of a PDF as a PNG data URL, ~2× the shown width for sharp
// thumbnails. pdf.js is loaded only when the first PDF thumbnail is needed,
// so it doesn't weigh on the app's first load. The file endpoints need the
// login cookie, hence withCredentials.
function renderPdfThumb(url: string, width: number): Promise<string | null> {
  const cached = pdfThumbCache.get(url);
  if (cached) return cached;
  const job = (async () => {
    try {
      const pdfjs = await import('pdfjs-dist');
      const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const pdf = await pdfjs.getDocument({ url, withCredentials: true }).promise;
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (width * 2) / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      pdf.destroy();
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  })();
  pdfThumbCache.set(url, job);
  return job;
}

interface FileThumbProps {
  url: string; // absolute URL of the file
  alt: string;
  width?: number; // CSS pixels the thumbnail is shown at
}

// A preview of an uploaded map or document: images as they are, PDFs as their
// first page; 📄 while loading or if a PDF can't be drawn.
export function FileThumb({ url, alt, width = 240 }: FileThumbProps) {
  const image = isImageFile(url);
  const [pdfThumb, setPdfThumb] = useState<string | null>(null);

  useEffect(() => {
    if (image) return;
    let cancelled = false;
    renderPdfThumb(url, width).then((dataUrl) => {
      if (!cancelled) setPdfThumb(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url, width, image]);

  if (image) return <img src={url} alt={alt} />;
  if (pdfThumb) return <img src={pdfThumb} alt={alt} className="pdf-thumb" />;
  return <div className="map-thumb-icon">📄</div>;
}
