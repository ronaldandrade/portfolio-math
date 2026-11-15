"use client";

import { useEffect, useRef, useState } from "react";
import { drawScene, prefersReducedMotion, relPos, useOnScreen } from "./shared";

const VIEW = 640;
const CELULAS = 6; // a lente mostra 6 × 6 pixels
const LADO = 252; // lado da lente, em pixels internos

/**
 * Abertura da página: a cena de teste com uma lente que mostra, no lugar da
 * imagem, os números que o computador recebe daquela região.
 */
export default function HeroLens() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visible = useOnScreen(canvasRef);
  const [alvo, setAlvo] = useState<{ u: number; v: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const cena = document.createElement("canvas");
    cena.width = cena.height = VIEW;
    const cctx = cena.getContext("2d")!;
    const mini = document.createElement("canvas");
    mini.width = mini.height = CELULAS;
    const mctx = mini.getContext("2d", { willReadFrequently: true })!;
    mctx.imageSmoothingQuality = "high";

    const frame = (ms: number) => {
      const t = ms / 1000;
      drawScene(cctx, VIEW, t);
      ctx.drawImage(cena, 0, 0);

      // Sem ponteiro, a lente passeia sozinha pela cena
      const u = alvo ? alvo.u : 0.5 + 0.3 * Math.sin(t * 0.45);
      const v = alvo ? alvo.v : 0.52 + 0.22 * Math.sin(t * 0.7 + 1);
      const x0 = Math.min(VIEW - LADO, Math.max(0, u * VIEW - LADO / 2));
      const y0 = Math.min(VIEW - LADO, Math.max(0, v * VIEW - LADO / 2));

      mctx.drawImage(cena, x0, y0, LADO, LADO, 0, 0, CELULAS, CELULAS);
      const d = mctx.getImageData(0, 0, CELULAS, CELULAS).data;
      const c = LADO / CELULAS;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 17px ui-monospace, monospace";
      for (let j = 0; j < CELULAS; j++) {
        for (let i = 0; i < CELULAS; i++) {
          const k = (j * CELULAS + i) * 4;
          const lum = Math.round(0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]);
          ctx.fillStyle = `rgb(${d[k]},${d[k + 1]},${d[k + 2]})`;
          ctx.fillRect(x0 + i * c, y0 + j * c, c, c);
          ctx.fillStyle = lum > 140 ? "#111" : "#fff";
          ctx.fillText(String(lum), x0 + i * c + c / 2, y0 + j * c + c / 2);
        }
      }
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 1; k < CELULAS; k++) {
        ctx.moveTo(x0 + k * c, y0);
        ctx.lineTo(x0 + k * c, y0 + LADO);
        ctx.moveTo(x0, y0 + k * c);
        ctx.lineTo(x0 + LADO, y0 + k * c);
      }
      ctx.stroke();
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#111";
      ctx.strokeRect(x0, y0, LADO, LADO);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(x0, y0, LADO, LADO);
    };

    if (!visible || prefersReducedMotion()) {
      frame(1200);
      return;
    }
    let raf = 0;
    const loop = (ms: number) => {
      frame(ms);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [alvo, visible]);

  return (
    <div className="visor">
      <canvas
        ref={canvasRef}
        width={VIEW}
        height={VIEW}
        className="block w-full h-auto touch-none cursor-crosshair"
        onPointerMove={(e) => setAlvo(relPos(e, e.currentTarget))}
        onPointerDown={(e) => setAlvo(relPos(e, e.currentTarget))}
        onPointerLeave={() => setAlvo(null)}
        aria-label="Cena com uma lente que mostra a luminância, de 0 a 255, de cada pixel sob o ponteiro."
      />
    </div>
  );
}
