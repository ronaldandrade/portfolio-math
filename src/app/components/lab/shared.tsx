"use client";

import { useEffect, useId, useState, type ReactNode, type RefObject } from "react";
import katex from "katex";
import { useTheme } from "next-themes";

/** Cores usadas nos canvases. Espelham os tokens de `laboratorio/lab.css`. */
export interface LabPalette {
  bg: string;
  card: string;
  fg: string;
  muted: string;
  grid: string;
  primary: string;
  /** Série/classe A (teal). */
  a: string;
  /** Série/classe B (laranja). */
  b: string;
}

const LIGHT: LabPalette = {
  bg: "#ecedeb",
  card: "#f7f7f5",
  fg: "#14181c",
  muted: "#55595e",
  grid: "#c9cbc8",
  primary: "#1d4f91",
  a: "#008a80",
  b: "#c9652b",
};

const DARK: LabPalette = {
  bg: "#15171a",
  card: "#1e2125",
  fg: "#e8e9e6",
  muted: "#a3a7ab",
  grid: "#33373c",
  primary: "#7fb0ea",
  a: "#2ea198",
  b: "#cc7a38",
};

/** Paleta do canvas conforme o tema ativo do site. */
export function useLabPalette(): LabPalette {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? DARK : LIGHT;
}

/** `true` enquanto o elemento está visível na tela; pausa animações fora dela. */
export function useOnScreen(ref: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

/** Verdadeiro se o visitante pediu menos movimento no sistema. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Converte "#rrggbb" em [r, g, b]. */
export function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Interpolação linear entre duas cores RGB. */
export function mixRgb(
  c0: [number, number, number],
  c1: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    c0[0] + (c1[0] - c0[0]) * t,
    c0[1] + (c1[1] - c0[1]) * t,
    c0[2] + (c1[2] - c0[2]) * t,
  ];
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Amostra de N(0, 1) por Box–Muller. */
export function gauss(rng: () => number): number {
  const u = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

/** Posição do ponteiro em coordenadas normalizadas [0, 1] do elemento. */
export function relPos(
  e: { clientX: number; clientY: number },
  el: HTMLElement,
): { u: number; v: number } {
  const r = el.getBoundingClientRect();
  return {
    u: Math.min(0.9999, Math.max(0, (e.clientX - r.left) / r.width)),
    v: Math.min(0.9999, Math.max(0, (e.clientY - r.top) / r.height)),
  };
}

/** Fórmula renderizada com KaTeX. */
export function Formula({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: block, throwOnError: false });
  return (
    <span
      className={block ? "block overflow-x-auto overflow-y-hidden py-1" : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Legenda acima de um painel (canvas). */
export function Painel({
  rotulo,
  titulo,
  children,
  className = "",
}: {
  rotulo?: string;
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={`min-w-0 flex flex-col gap-2 ${className}`}>
      <figcaption className="flex items-baseline gap-2 text-xs uppercase tracking-[0.15em]">
        {rotulo && <span className="text-primary font-semibold">{rotulo}</span>}
        <span className="text-muted-foreground">{titulo}</span>
      </figcaption>
      {children}
    </figure>
  );
}

/** Classe padrão dos canvases: ocupam a largura do painel e mantêm a proporção. */
export const canvasClass = "block w-full h-auto border border-border bg-card touch-none";

/** Controle deslizante com rótulo e valor atual. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 min-w-[11rem] flex-1">
      <div className="flex justify-between gap-3 text-xs">
        <label htmlFor={id} className="uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </label>
        <span className="tabular-nums font-medium">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
      />
    </div>
  );
}

/** Grupo de botões de escolha única. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 text-xs border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              o.value === value
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:border-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Botão de ação da bancada. */
export function LabButton({
  children,
  onClick,
  primary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-xs font-medium border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        primary
          ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
          : "border-foreground hover:bg-foreground hover:text-background"
      }`}
    >
      {children}
    </button>
  );
}

/** Faixa de controles acima dos painéis. */
export function Controles({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-5 bg-card border border-border p-4 md:p-5 mb-6">
      {children}
    </div>
  );
}

/** Desenha a cena de teste (céu, sol, morros, casa, bola e piso xadrez). */
export function drawScene(ctx: CanvasRenderingContext2D, size: number, t: number): void {
  const s = size;
  const sky = ctx.createLinearGradient(0, 0, 0, s * 0.7);
  sky.addColorStop(0, "#7fb2dc");
  sky.addColorStop(1, "#f1dfb4");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, s, s);

  // Sol
  ctx.fillStyle = "#f6c945";
  ctx.beginPath();
  ctx.arc(s * 0.8, s * 0.18, s * 0.085, 0, Math.PI * 2);
  ctx.fill();

  // Morros
  ctx.fillStyle = "#5f8f5a";
  ctx.beginPath();
  ctx.moveTo(0, s * 0.62);
  ctx.quadraticCurveTo(s * 0.25, s * 0.38, s * 0.55, s * 0.6);
  ctx.quadraticCurveTo(s * 0.8, s * 0.45, s, s * 0.58);
  ctx.lineTo(s, s * 0.75);
  ctx.lineTo(0, s * 0.75);
  ctx.fill();

  // Casa
  ctx.fillStyle = "#b9482f";
  ctx.fillRect(s * 0.12, s * 0.46, s * 0.26, s * 0.24);
  ctx.fillStyle = "#3b2f2a";
  ctx.beginPath();
  ctx.moveTo(s * 0.09, s * 0.47);
  ctx.lineTo(s * 0.25, s * 0.32);
  ctx.lineTo(s * 0.41, s * 0.47);
  ctx.fill();
  ctx.fillStyle = "#e8eef2";
  ctx.fillRect(s * 0.17, s * 0.52, s * 0.07, s * 0.07);
  ctx.fillStyle = "#2f4e7a";
  ctx.fillRect(s * 0.28, s * 0.55, s * 0.06, s * 0.15);

  // Piso xadrez (alta frequência: bom para ver o efeito da resolução)
  const rows = 3;
  const cols = 12;
  const y0 = s * 0.7;
  const ch = (s - y0) / rows;
  const cw = s / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? "#ece6d8" : "#3d3a36";
      ctx.fillRect(c * cw, y0 + r * ch, cw + 1, ch + 1);
    }
  }

  // Bola sombreada que atravessa a cena
  const bx = s * (0.62 + 0.2 * Math.sin(t * 0.8));
  const by = s * 0.66 - Math.abs(Math.sin(t * 2.4)) * s * 0.12;
  const br = s * 0.1;
  const ball = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.4, br * 0.1, bx, by, br);
  ball.addColorStop(0, "#ffd9a8");
  ball.addColorStop(0.5, "#e8792e");
  ball.addColorStop(1, "#7a3210");
  ctx.fillStyle = ball;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fill();
}
