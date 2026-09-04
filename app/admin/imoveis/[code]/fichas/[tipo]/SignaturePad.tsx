"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type SignaturePadProps = {
  label: string;
};

export default function SignaturePad({
  label,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    const pixelRatio = window.devicePixelRatio || 1;

    const oldCanvas = document.createElement("canvas");
    oldCanvas.width = canvas.width;
    oldCanvas.height = canvas.height;

    if (canvas.width > 0 && canvas.height > 0) {
      const oldContext = oldCanvas.getContext("2d");
      oldContext?.drawImage(canvas, 0, 0);
    }

    canvas.width = Math.round(rect.width * pixelRatio);
    canvas.height = Math.round(rect.height * pixelRatio);

    const context = canvas.getContext("2d");

    if (!context) return;

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0,
    );

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.2;
    context.strokeStyle = "#18181b";

    if (
      hasSignature &&
      oldCanvas.width > 0 &&
      oldCanvas.height > 0
    ) {
      context.drawImage(
        oldCanvas,
        0,
        0,
        oldCanvas.width,
        oldCanvas.height,
        0,
        0,
        rect.width,
        rect.height,
      );
    }
  }, [hasSignature]);

  useEffect(() => {
    prepareCanvas();

    const canvas = canvasRef.current;

    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      prepareCanvas();
    });

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [prepareCanvas]);

  function getPoint(
    event:
      | ReactPointerEvent<HTMLCanvasElement>
      | PointerEvent,
  ) {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;

    if (!canvas) return;

    event.preventDefault();

    canvas.setPointerCapture(event.pointerId);

    drawingRef.current = true;
    lastPointRef.current = getPoint(event);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    if (!drawingRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const previousPoint = lastPointRef.current;
    const currentPoint = getPoint(event);

    if (!canvas || !previousPoint || !currentPoint) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(currentPoint.x, currentPoint.y);
    context.stroke();

    lastPointRef.current = currentPoint;
    setHasSignature(true);
  }

  function stopDrawing(
    event?: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    drawingRef.current = false;
    lastPointRef.current = null;

    if (
      event &&
      canvasRef.current?.hasPointerCapture(event.pointerId)
    ) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    setHasSignature(false);
  }

  return (
    <div className="min-w-0">
      <div className="signature-box relative overflow-hidden border border-zinc-300 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={(event) => {
            if (
              drawingRef.current &&
              event.buttons === 0
            ) {
              stopDrawing(event);
            }
          }}
          className="block h-28 w-full cursor-crosshair bg-white touch-none"
          aria-label={label}
        />

        {!hasSignature ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[9px] text-zinc-400 print:hidden">
            Assine aqui com o dedo, caneta ou mouse
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="flex-1 border-t border-zinc-500 pt-2 text-center text-[9px] text-zinc-600">
          {label}
        </p>

        <button
          type="button"
          onClick={clearSignature}
          disabled={!hasSignature}
          className="shrink-0 border border-zinc-300 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-600 transition hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-30 print:hidden"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
