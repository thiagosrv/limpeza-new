"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Eraser, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface SignaturePadHandle {
  isEmpty: () => boolean;
  clear: () => void;
  toBlob: () => Promise<Blob | null>;
}

type Point = { x: number; y: number };

const INK_COLOR = "#0C1566";

export const SignaturePad = forwardRef<
  SignaturePadHandle,
  { className?: string; onChange?: (hasSignature: boolean) => void }
>(function SignaturePad({ className, onChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Point[][]>([]);
  const currentStrokeRef = useRef<Point[] | null>(null);
  const drawingRef = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  function getContext() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function redrawAll() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }
  }

  function drawStroke(ctx: CanvasRenderingContext2D, points: Point[]) {
    if (points.length === 0) return;
    ctx.strokeStyle = INK_COLOR;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const first = points[0]!;
    ctx.moveTo(first.x, first.y);
    for (const point of points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = getContext();
      ctx?.scale(dpr, dpr);
      redrawAll();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getRelativePoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    currentStrokeRef.current = [getRelativePoint(e)];
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    const point = getRelativePoint(e);
    const ctx = getContext();
    const previous = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    currentStrokeRef.current.push(point);
    if (ctx && previous) {
      ctx.strokeStyle = INK_COLOR;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  }

  function handlePointerUp() {
    if (currentStrokeRef.current && currentStrokeRef.current.length > 1) {
      strokesRef.current.push(currentStrokeRef.current);
      setHasStrokes(true);
      onChange?.(true);
    }
    currentStrokeRef.current = null;
    drawingRef.current = false;
  }

  function clear() {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setHasStrokes(false);
    redrawAll();
    onChange?.(false);
  }

  function undo() {
    strokesRef.current.pop();
    const remaining = strokesRef.current.length > 0;
    setHasStrokes(remaining);
    redrawAll();
    onChange?.(remaining);
  }

  useImperativeHandle(ref, () => ({
    isEmpty: () => strokesRef.current.length === 0,
    clear,
    toBlob: () =>
      new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve(null);
        canvas.toBlob((blob) => resolve(blob), "image/png");
      }),
  }));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative h-44 w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          aria-label="Área para assinatura digital"
          role="img"
        />
        {!hasStrokes && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs font-medium text-slate-300">
            Assine aqui com o dedo ou caneta
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={undo} disabled={!hasStrokes}>
          <Undo2 className="size-4" />
          Desfazer
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!hasStrokes}>
          <Eraser className="size-4" />
          Limpar
        </Button>
      </div>
    </div>
  );
});
