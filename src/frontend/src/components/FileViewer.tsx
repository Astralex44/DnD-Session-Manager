import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';

const MIN_SCALE = 0.05;
const MAX_SCALE = 8;
const STEP = 1.25;

function isImageFile(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(url);
}

interface View {
  scale: number;
  x: number;
  y: number;
}

interface FileViewerProps {
  url: string; // absolute URL of the file
  name: string;
  onClose: () => void;
}

// A map or document almost full screen (DM request, 2026-10-31). Images get
// zoom (wheel, pinch, buttons, double-click) and drag-to-pan; a PDF is shown
// in the browser's own PDF viewer, which brings zoom and pages itself. "Open
// in new tab" is there for both — a second monitor, or a phone whose browser
// can't show PDFs inline.
export function FileViewer({ url, name, onClose }: FileViewerProps) {
  const image = isImageFile(url);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="file-viewer" onClick={(e) => e.stopPropagation()}>
        {image
          ? <ImageStage url={url} name={name} onClose={onClose} />
          : (
            <>
              <ViewerBar name={name} url={url} onClose={onClose} />
              <iframe className="file-viewer-pdf" src={url} title={name} />
            </>
          )}
      </div>
    </div>
  );
}

interface ViewerBarProps {
  name: string;
  url: string;
  onClose: () => void;
  children?: ReactNode;
}

function ViewerBar({ name, url, onClose, children }: ViewerBarProps) {
  return (
    <div className="file-viewer-bar">
      <h3>{name}</h3>
      <div className="file-viewer-controls">
        {children}
        <a className="btn-ghost" href={url} target="_blank" rel="noreferrer" title="Open in a new tab"><span className="file-viewer-label">Open in new tab </span>↗</a>
        <button className="btn-ghost" onClick={onClose} title="Close (Esc)">✕</button>
      </div>
    </div>
  );
}

function ImageStage({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistance = useRef<number | null>(null);

  const fitView = useCallback((size = natural): View | null => {
    const stage = stageRef.current;
    if (!stage || !size) return null;
    const { clientWidth: cw, clientHeight: ch } = stage;
    const scale = Math.min(cw / size.w, ch / size.h);
    return { scale, x: (cw - size.w * scale) / 2, y: (ch - size.h * scale) / 2 };
  }, [natural]);

  // Start fitted once the image's size is known.
  function onImageLoad(img: HTMLImageElement) {
    const size = { w: img.naturalWidth, h: img.naturalHeight };
    setNatural(size);
    const fitted = fitView(size);
    if (fitted) setView(fitted);
  }

  // Zoom keeping the point under (px, py) — stage coordinates, the centre
  // when left out — in place. `toScale` maps the current scale to the new one.
  const zoomTo = useCallback((toScale: (scale: number) => number, px?: number, py?: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const cx = px ?? stage.clientWidth / 2;
    const cy = py ?? stage.clientHeight / 2;
    setView((v) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, toScale(v.scale)));
      const ratio = scale / v.scale;
      return { scale, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio };
    });
  }, []);

  const zoomAt = useCallback(
    (factor: number, px?: number, py?: number) => zoomTo((scale) => scale * factor, px, py),
    [zoomTo],
  );

  // The wheel listener has to be non-passive to stop the page scrolling,
  // which React's onWheel can't do.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = stage!.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    }
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '+' || e.key === '=') zoomAt(STEP);
      else if (e.key === '-') zoomAt(1 / STEP);
      else if (e.key === '0') { const f = fitView(); if (f) setView(f); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomAt, fitView]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pinchDistance.current = null;
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      // Pinch: zoom by the change in finger distance, around their midpoint.
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistance.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        zoomAt(distance / pinchDistance.current, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
      }
      pinchDistance.current = distance;
      return;
    }
    const dx = e.clientX - previous.x;
    const dy = e.clientY - previous.y;
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    pinchDistance.current = null;
  }

  function onDoubleClick(e: ReactMouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    zoomAt(2, e.clientX - rect.left, e.clientY - rect.top);
  }

  return (
    <>
      <ViewerBar name={name} url={url} onClose={onClose}>
        <button className="btn-ghost" onClick={() => zoomAt(1 / STEP)} title="Zoom out (−)">−</button>
        <span className="file-viewer-zoom">{Math.round(view.scale * 100)}%</span>
        <button className="btn-ghost" onClick={() => zoomAt(STEP)} title="Zoom in (+)">+</button>
        <button className="btn-ghost" onClick={() => { const f = fitView(); if (f) setView(f); }} title="Fit to screen (0)">Fit</button>
        <button className="btn-ghost" onClick={() => zoomTo(() => 1)} title="Actual size">100%</button>
      </ViewerBar>
      <div
        ref={stageRef}
        className="file-viewer-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        <img
          src={url}
          alt={name}
          draggable={false}
          onLoad={(e) => onImageLoad(e.currentTarget)}
          style={{
            width: natural?.w,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            visibility: natural ? 'visible' : 'hidden',
          }}
        />
      </div>
    </>
  );
}
