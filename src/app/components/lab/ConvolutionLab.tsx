"use client";

import { useEffect, useRef, useState } from "react";
import {
  Controles,
  Formula,
  LabButton,
  Painel,
  Segmented,
  canvasClass,
  drawScene,
  prefersReducedMotion,
  relPos,
  useLabPalette,
  type LabPalette,
} from "./shared";

const N = 48; // lado da imagem em pixels
const VIEW = 624; // 13 px internos por pixel
const CELL = VIEW / N;

type Preset =
  | "identidade"
  | "desfoque"
  | "gauss"
  | "nitidez"
  | "sobelx"
  | "sobely"
  | "laplaciano"
  | "relevo";

const PRESETS: Record<Preset, { label: string; k: number[] }> = {
  identidade: { label: "Identidade", k: [0, 0, 0, 0, 1, 0, 0, 0, 0] },
  desfoque: { label: "Desfoque", k: [1, 1, 1, 1, 1, 1, 1, 1, 1].map((v) => v / 9) },
  gauss: { label: "Gaussiano", k: [1, 2, 1, 2, 4, 2, 1, 2, 1].map((v) => v / 16) },
  nitidez: { label: "Nitidez", k: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
  sobelx: { label: "Sobel X", k: [-1, 0, 1, -2, 0, 2, -1, 0, 1] },
  sobely: { label: "Sobel Y", k: [-1, -2, -1, 0, 0, 0, 1, 2, 1] },
  laplaciano: { label: "Laplaciano", k: [0, 1, 0, 1, -4, 1, 0, 1, 0] },
  relevo: { label: "Relevo", k: [-2, -1, 0, -1, 1, 1, 0, 1, 2] },
};

let cacheCinza: Float32Array | null = null;

/** Imagem de entrada em tons de cinza (0–255), N×N, gerada a partir da cena de teste. */
function imagemCinza(): Float32Array {
  if (cacheCinza) return cacheCinza;
  const big = document.createElement("canvas");
  big.width = big.height = 384;
  const bctx = big.getContext("2d")!;
  drawScene(bctx, 384, 0.6);
  const small = document.createElement("canvas");
  small.width = small.height = N;
  const sctx = small.getContext("2d")!;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(big, 0, 0, N, N);
  const d = sctx.getImageData(0, 0, N, N).data;
  const out = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    out[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
  }
  cacheCinza = out;
  return out;
}

/** Valor do pixel com borda replicada. */
function px(img: Float32Array, x: number, y: number): number {
  const cx = Math.min(N - 1, Math.max(0, x));
  const cy = Math.min(N - 1, Math.max(0, y));
  return img[cy * N + cx];
}

/** Soma ponderada da vizinhança 3×3 de (x, y) pelo kernel. */
function aplicar(img: Float32Array, k: number[], x: number, y: number): number {
  let s = 0;
  for (let v = -1; v <= 1; v++) {
    for (let u = -1; u <= 1; u++) {
      s += px(img, x + u, y + v) * k[(v + 1) * 3 + (u + 1)];
    }
  }
  return s;
}

/** Converte a resposta bruta do filtro em um tom de cinza exibível (0–255). */
function exibir(valor: number, k: number[]): number {
  const soma = k.reduce((a, b) => a + b, 0);
  if (Math.abs(soma) < 1e-6) {
    // Kernels de derivada: mostra a magnitude, normalizada pelos pesos positivos
    const pos = k.reduce((a, b) => a + Math.max(b, 0), 0) || 1;
    return Math.min(255, Math.abs(valor) / pos);
  }
  return Math.min(255, Math.max(0, valor / soma));
}

/** Formata um número curto para caber numa célula. */
function fmt(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(Math.abs(v) < 10 ? 2 : 0).replace(".", ",");
}

/** Desenha uma grade 3×3 de valores no canvas de cálculo. */
function grade3(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lado: number,
  valores: number[],
  palette: LabPalette,
  tons: boolean,
): void {
  const c = lado / 3;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "500 22px ui-monospace, monospace";
  for (let i = 0; i < 9; i++) {
    const cx = x + (i % 3) * c;
    const cy = y + Math.floor(i / 3) * c;
    if (tons) {
      ctx.fillStyle = `rgb(${valores[i]},${valores[i]},${valores[i]})`;
      ctx.fillRect(cx, cy, c, c);
      ctx.fillStyle = valores[i] > 140 ? "#111" : "#fff";
    } else {
      ctx.fillStyle = palette.bg;
      ctx.fillRect(cx, cy, c, c);
      ctx.fillStyle = palette.fg;
    }
    ctx.fillText(fmt(valores[i]), cx + c / 2, cy + c / 2);
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, c, c);
  }
}

/**
 * Convolução 2D passo a passo: um kernel 3×3 editável desliza sobre a imagem
 * e o cálculo do pixel sob o ponteiro aparece por extenso.
 */
export default function ConvolutionLab() {
  const palette = useLabPalette();
  const inRef = useRef<HTMLCanvasElement>(null);
  const outRef = useRef<HTMLCanvasElement>(null);
  const calcRef = useRef<HTMLCanvasElement>(null);
  const inCacheRef = useRef<HTMLCanvasElement | null>(null);
  const outCacheRef = useRef<{ key: string; cv: HTMLCanvasElement } | null>(null);

  const [preset, setPreset] = useState<Preset | "custom">("sobelx");
  const [kernel, setKernel] = useState<number[]>(PRESETS.sobelx.k);
  const [pos, setPos] = useState({ x: 34, y: 28 });
  const [varrendo, setVarrendo] = useState(false);

  const escolherPreset = (p: Preset) => {
    setPreset(p);
    setKernel(PRESETS[p].k);
  };

  const editarPeso = (i: number, texto: string) => {
    const v = Number(texto.replace(",", "."));
    if (!Number.isFinite(v)) return;
    setPreset("custom");
    setKernel(kernel.map((k, j) => (j === i ? v : k)));
  };

  const apontar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (varrendo) return;
    const { u, v } = relPos(e, e.currentTarget);
    setPos({ x: Math.floor(u * N), y: Math.floor(v * N) });
  };

  useEffect(() => {
    const cin = inRef.current;
    const cout = outRef.current;
    const ccalc = calcRef.current;
    if (!cin || !cout || !ccalc) return;
    const ictx = cin.getContext("2d");
    const octx = cout.getContext("2d");
    const kctx = ccalc.getContext("2d");
    if (!ictx || !octx || !kctx) return;

    const img = imagemCinza();

    // Cache da entrada (N×N): renderizado uma única vez
    let inCache = inCacheRef.current;
    if (!inCache) {
      inCache = document.createElement("canvas");
      inCache.width = inCache.height = N;
      const cctx = inCache.getContext("2d")!;
      const idata = cctx.createImageData(N, N);
      for (let i = 0; i < N * N; i++) {
        const g = img[i];
        idata.data[i * 4] = g;
        idata.data[i * 4 + 1] = g;
        idata.data[i * 4 + 2] = g;
        idata.data[i * 4 + 3] = 255;
      }
      cctx.putImageData(idata, 0, 0);
      inCacheRef.current = inCache;
    }

    // Cache da saída (N×N): recalculado somente quando o kernel muda
    const kKey = kernel.join(",");
    let outCache = outCacheRef.current?.key === kKey ? outCacheRef.current.cv : null;
    if (!outCache) {
      outCache = document.createElement("canvas");
      outCache.width = outCache.height = N;
      const cctx = outCache.getContext("2d")!;
      const idata = cctx.createImageData(N, N);
      for (let i = 0; i < N * N; i++) {
        const g = Math.round(exibir(aplicar(img, kernel, i % N, Math.floor(i / N)), kernel));
        idata.data[i * 4] = g;
        idata.data[i * 4 + 1] = g;
        idata.data[i * 4 + 2] = g;
        idata.data[i * 4 + 3] = 255;
      }
      cctx.putImageData(idata, 0, 0);
      outCacheRef.current = { key: kKey, cv: outCache };
    }

    /** Desenha os três painéis com a janela em (x, y) e a saída preenchida até `ate`. */
    const desenhar = (x: number, y: number, ate: number) => {
      ictx.imageSmoothingEnabled = false;
      ictx.drawImage(inCache, 0, 0, VIEW, VIEW);

      octx.fillStyle = palette.card;
      octx.fillRect(0, 0, VIEW, VIEW);
      octx.imageSmoothingEnabled = false;
      if (ate >= N * N) {
        octx.drawImage(outCache, 0, 0, VIEW, VIEW);
      } else if (ate > 0) {
        const fullRows = Math.floor(ate / N);
        const remCols = ate % N;
        if (fullRows > 0) {
          octx.drawImage(outCache, 0, 0, N, fullRows, 0, 0, VIEW, fullRows * CELL);
        }
        if (remCols > 0) {
          octx.drawImage(outCache, 0, fullRows, remCols, 1, 0, fullRows * CELL, remCols * CELL, CELL);
        }
      }
      // Janela 3×3 na entrada e pixel correspondente na saída
      for (const [ctx, x0, y0, lado] of [
        [ictx, (x - 1) * CELL, (y - 1) * CELL, CELL * 3],
        [octx, x * CELL, y * CELL, CELL],
      ] as const) {
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#000";
        ctx.strokeRect(x0, y0, lado, lado);
        ctx.lineWidth = 3;
        ctx.strokeStyle = palette.b;
        ctx.strokeRect(x0, y0, lado, lado);
      }

      // Cálculo por extenso: vizinhança ⊙ kernel = soma
      const W = ccalc.width;
      const H = ccalc.height;
      kctx.fillStyle = palette.card;
      kctx.fillRect(0, 0, W, H);
      const lado = 180;
      const top = 62;
      const viz: number[] = [];
      for (let v = -1; v <= 1; v++) for (let u = -1; u <= 1; u++) viz.push(px(img, x + u, y + v));
      const bruto = aplicar(img, kernel, x, y);
      const tom = Math.round(exibir(bruto, kernel));

      kctx.fillStyle = palette.muted;
      kctx.font = "500 18px ui-monospace, monospace";
      kctx.textAlign = "left";
      kctx.textBaseline = "alphabetic";
      kctx.fillText(`VIZINHANÇA DE (${x}, ${y})`, 30, 40);
      kctx.fillText("KERNEL", 290, 40);
      kctx.fillText("SOMA", 550, 40);

      grade3(kctx, 30, top, lado, viz, palette, true);
      grade3(kctx, 290, top, lado, kernel, palette, false);

      kctx.fillStyle = palette.fg;
      kctx.textAlign = "center";
      kctx.textBaseline = "middle";
      kctx.font = "600 34px ui-monospace, monospace";
      kctx.fillText("⊙", 250, top + lado / 2);
      kctx.fillText("=", 510, top + lado / 2);
      kctx.textAlign = "left";
      kctx.font = "700 44px ui-monospace, monospace";
      kctx.fillText(fmt(Math.round(bruto * 100) / 100), 550, top + 50);
      kctx.font = "500 18px ui-monospace, monospace";
      kctx.fillStyle = palette.muted;
      kctx.fillText("pixel exibido", 550, top + 108);
      kctx.fillStyle = `rgb(${tom},${tom},${tom})`;
      kctx.fillRect(550, top + 126, 54, 54);
      kctx.strokeStyle = palette.b;
      kctx.lineWidth = 3;
      kctx.strokeRect(550, top + 126, 54, 54);
      kctx.fillStyle = palette.fg;
      kctx.font = "600 26px ui-monospace, monospace";
      kctx.fillText(String(tom), 618, top + 154);
    };

    if (!varrendo) {
      desenhar(pos.x, pos.y, N * N);
      return;
    }
    if (prefersReducedMotion()) {
      desenhar(pos.x, pos.y, N * N);
      const id = requestAnimationFrame(() => setVarrendo(false));
      return () => cancelAnimationFrame(id);
    }
    let k = 0;
    let raf = 0;
    const passo = () => {
      k = Math.min(N * N, k + 10);
      const i = Math.min(N * N - 1, k);
      desenhar(i % N, Math.floor(i / N), k);
      if (k >= N * N) {
        setVarrendo(false);
        return;
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [palette, kernel, pos, varrendo]);

  return (
    <div>
      <Controles>
        <Segmented<Preset | "custom">
          label="Kernel"
          value={preset}
          onChange={(p) => p !== "custom" && escolherPreset(p)}
          options={(Object.keys(PRESETS) as Preset[]).map((p) => ({
            value: p,
            label: PRESETS[p].label,
          }))}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Pesos (editáveis)
          </span>
          <div className="grid grid-cols-3 gap-1 w-[11.5rem]">
            {kernel.map((k, i) => (
              <input
                key={i}
                id={`kernel-${i}`}
                aria-label={`Peso da linha ${Math.floor(i / 3) + 1}, coluna ${(i % 3) + 1}`}
                type="number"
                step={0.5}
                value={Math.round(k * 1000) / 1000}
                onChange={(e) => editarPeso(i, e.target.value)}
                className="w-full bg-background border border-border px-1.5 py-1.5 text-center text-sm tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              />
            ))}
          </div>
        </div>
        <LabButton onClick={() => setVarrendo(true)} primary>
          {varrendo ? "Varrendo…" : "Animar varredura"}
        </LabButton>
      </Controles>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.15fr]">
        <Painel rotulo="1." titulo={`Entrada: ${N} × ${N} em cinza`}>
          <canvas
            ref={inRef}
            width={VIEW}
            height={VIEW}
            className={`${canvasClass} cursor-crosshair`}
            onPointerMove={apontar}
            onPointerDown={apontar}
            aria-label="Imagem de entrada. Passe o ponteiro para escolher o pixel calculado."
          />
        </Painel>
        <Painel rotulo="2." titulo="Saída: mapa de características">
          <canvas
            ref={outRef}
            width={VIEW}
            height={VIEW}
            className={`${canvasClass} cursor-crosshair`}
            onPointerMove={apontar}
            onPointerDown={apontar}
            aria-label="Resultado do filtro aplicado à imagem."
          />
        </Painel>
        <Painel rotulo="3." titulo="O cálculo de um pixel" className="md:col-span-2 lg:col-span-1">
          <canvas
            ref={calcRef}
            width={720}
            height={290}
            className={canvasClass}
            aria-label="Vizinhança 3 por 3 multiplicada pelo kernel, elemento a elemento, e somada."
          />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <Formula
              block
              tex={String.raw`S(i,j) = \sum_{u=-1}^{1} \sum_{v=-1}^{1} I(i+u,\, j+v)\, K(u,v)`}
            />
            <p className="mt-2">
              Para caber em 0–255, a saída é dividida pela soma dos pesos. Quando a soma é zero
              (Sobel, Laplaciano), o painel mostra o módulo da resposta: bordas ficam claras.
            </p>
          </div>
        </Painel>
      </div>
    </div>
  );
}
