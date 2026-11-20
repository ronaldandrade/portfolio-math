"use client";

import { useEffect, useRef, useState } from "react";
import {
  Controles,
  Formula,
  LabButton,
  Painel,
  Segmented,
  Slider,
  canvasClass,
  hexToRgb,
  mixRgb,
  prefersReducedMotion,
  relPos,
  useLabPalette,
  useOnScreen,
  type LabPalette,
} from "./shared";

type FuncaoId = "vale" | "rosenbrock" | "himmelblau";
type Otimizador = "gd" | "momento" | "adam";

interface Funcao {
  label: string;
  /** Domínio [x0, x1, y0, y1]. */
  dom: [number, number, number, number];
  f: (x: number, y: number) => number;
  grad: (x: number, y: number) => [number, number];
  inicio: [number, number];
  minimos: [number, number][];
  /** log10 da taxa de aprendizado inicial. */
  lr: number;
  tex: string;
}

const FUNCOES: Record<FuncaoId, Funcao> = {
  vale: {
    label: "Vale alongado",
    dom: [-3, 3, -3, 3],
    f: (x, y) => 0.5 * (x * x + 12 * y * y),
    grad: (x, y) => [x, 12 * y],
    inicio: [-2.6, 1.3],
    minimos: [[0, 0]],
    lr: -1.0,
    tex: String.raw`f(x,y) = \tfrac{1}{2}\left(x^2 + 12y^2\right)`,
  },
  rosenbrock: {
    label: "Rosenbrock",
    dom: [-2, 2, -1, 3],
    f: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2,
    grad: (x, y) => [-2 * (1 - x) - 40 * x * (y - x * x), 20 * (y - x * x)],
    inicio: [-1.4, 2.2],
    minimos: [[1, 1]],
    lr: -2.4,
    tex: String.raw`f(x,y) = (1-x)^2 + 10\,(y - x^2)^2`,
  },
  himmelblau: {
    label: "Quatro mínimos",
    dom: [-5, 5, -5, 5],
    f: (x, y) => (x * x + y - 11) ** 2 + (x + y * y - 7) ** 2,
    grad: (x, y) => [
      4 * x * (x * x + y - 11) + 2 * (x + y * y - 7),
      2 * (x * x + y - 11) + 4 * y * (x + y * y - 7),
    ],
    inicio: [0.4, -0.6],
    minimos: [
      [3, 2],
      [-2.805, 3.131],
      [-3.779, -3.283],
      [3.584, -1.848],
    ],
    lr: -2.0,
    tex: String.raw`f(x,y) = (x^2 + y - 11)^2 + (x + y^2 - 7)^2`,
  },
};

const VIEW = 720;
const MAPA = 360; // resolução do mapa de níveis
const MAX_PASSOS = 400;
const FAIXAS = 16;

/** Renderiza o mapa de níveis (escala log, em faixas) num canvas fora da tela. */
function renderMapa(fn: Funcao, palette: LabPalette): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = cv.height = MAPA;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(MAPA, MAPA);
  const [x0, x1, y0, y1] = fn.dom;
  const vals = new Float32Array(MAPA * MAPA);
  let max = 0;
  for (let j = 0; j < MAPA; j++) {
    for (let i = 0; i < MAPA; i++) {
      const x = x0 + ((i + 0.5) / MAPA) * (x1 - x0);
      const y = y1 - ((j + 0.5) / MAPA) * (y1 - y0);
      const v = Math.log1p(fn.f(x, y));
      vals[j * MAPA + i] = v;
      if (v > max) max = v;
    }
  }
  const baixo = hexToRgb(palette.bg);
  const alto = hexToRgb(palette.primary);
  const linha = hexToRgb(palette.muted);
  const faixa = (k: number) => Math.min(FAIXAS - 1, Math.floor((vals[k] / max) * FAIXAS));
  for (let j = 0; j < MAPA; j++) {
    for (let i = 0; i < MAPA; i++) {
      const k = j * MAPA + i;
      const b = faixa(k);
      const borda =
        (i + 1 < MAPA && faixa(k + 1) !== b) || (j + 1 < MAPA && faixa(k + MAPA) !== b);
      const c = borda ? mixRgb(mixRgb(baixo, alto, b / FAIXAS), linha, 0.45) : mixRgb(baixo, alto, (b / (FAIXAS - 1)) * 0.85);
      img.data[k * 4] = c[0];
      img.data[k * 4 + 1] = c[1];
      img.data[k * 4 + 2] = c[2];
      img.data[k * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/** Notação curta para valores da perda. */
function sci(v: number): string {
  if (!Number.isFinite(v)) return "∞";
  if (v !== 0 && (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e4)) {
    return v.toExponential(1).replace(".", ",");
  }
  return v.toFixed(3).replace(".", ",");
}

/**
 * Descida de gradiente numa superfície 2D: clique para escolher o ponto de
 * partida e compare GD puro, momento e Adam.
 */
export default function GradientLab() {
  const palette = useLabPalette();
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(rootRef);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const lossRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLParagraphElement>(null);
  const mapaCacheRef = useRef<{ key: string; cv: HTMLCanvasElement } | null>(null);

  const [fnId, setFnId] = useState<FuncaoId>("vale");
  const [opt, setOpt] = useState<Otimizador>("gd");
  const [logLr, setLogLr] = useState(FUNCOES.vale.lr);
  const [inicio, setInicio] = useState<[number, number]>(FUNCOES.vale.inicio);
  const [rodada, setRodada] = useState(0);

  const fn = FUNCOES[fnId];
  const lr = 10 ** logLr;

  const trocarFuncao = (id: FuncaoId) => {
    setFnId(id);
    setLogLr(FUNCOES[id].lr);
    setInicio(FUNCOES[id].inicio);
  };

  const escolherInicio = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { u, v } = relPos(e, e.currentTarget);
    const [x0, x1, y0, y1] = fn.dom;
    setInicio([x0 + u * (x1 - x0), y1 - v * (y1 - y0)]);
    setRodada((r) => r + 1);
  };

  useEffect(() => {
    const cmap = mapRef.current;
    const closs = lossRef.current;
    if (!cmap || !closs) return;
    const ctx = cmap.getContext("2d");
    const lctx = closs.getContext("2d");
    if (!ctx || !lctx) return;

    const f = FUNCOES[fnId];
    const taxa = 10 ** logLr;
    const [x0, x1, y0, y1] = f.dom;
    const mapKey = `${fnId}:${palette.bg}:${palette.primary}:${palette.muted}`;
    let mapa = mapaCacheRef.current?.key === mapKey ? mapaCacheRef.current.cv : null;
    if (!mapa) {
      mapa = renderMapa(f, palette);
      mapaCacheRef.current = { key: mapKey, cv: mapa };
    }
    const toPx = (x: number, y: number): [number, number] => [
      ((x - x0) / (x1 - x0)) * VIEW,
      ((y1 - y) / (y1 - y0)) * VIEW,
    ];

    // Estado do otimizador
    let [x, y] = inicio;
    let vx = 0;
    let vy = 0;
    let mx = 0;
    let my = 0;
    let sx = 0;
    let sy = 0;
    let t = 0;
    let divergiu = false;
    let gnorm = 0;
    const caminho: [number, number][] = [[x, y]];
    const perdas: number[] = [f.f(x, y)];

    const passo = () => {
      const [gx, gy] = f.grad(x, y);
      gnorm = Math.hypot(gx, gy);
      t += 1;
      if (opt === "gd") {
        x -= taxa * gx;
        y -= taxa * gy;
      } else if (opt === "momento") {
        vx = 0.9 * vx - taxa * gx;
        vy = 0.9 * vy - taxa * gy;
        x += vx;
        y += vy;
      } else {
        mx = 0.9 * mx + 0.1 * gx;
        my = 0.9 * my + 0.1 * gy;
        sx = 0.999 * sx + 0.001 * gx * gx;
        sy = 0.999 * sy + 0.001 * gy * gy;
        const c1 = 1 - 0.9 ** t;
        const c2 = 1 - 0.999 ** t;
        x -= (taxa * (mx / c1)) / (Math.sqrt(sx / c2) + 1e-8);
        y -= (taxa * (my / c1)) / (Math.sqrt(sy / c2) + 1e-8);
      }
      if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e4 || Math.abs(y) > 1e4) {
        divergiu = true;
        return;
      }
      caminho.push([x, y]);
      perdas.push(f.f(x, y));
    };

    const desenhar = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(mapa, 0, 0, VIEW, VIEW);

      // Mínimos conhecidos
      ctx.strokeStyle = palette.fg;
      ctx.lineWidth = 3;
      for (const [mx0, my0] of f.minimos) {
        const [px, py] = toPx(mx0, my0);
        ctx.beginPath();
        ctx.moveTo(px - 9, py - 9);
        ctx.lineTo(px + 9, py + 9);
        ctx.moveTo(px + 9, py - 9);
        ctx.lineTo(px - 9, py + 9);
        ctx.stroke();
      }

      // Trajetória
      ctx.strokeStyle = palette.b;
      ctx.lineWidth = 3.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      caminho.forEach(([cx, cy], i) => {
        const [px, py] = toPx(cx, cy);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.fillStyle = palette.b;
      for (let i = 0; i < caminho.length; i += caminho.length > 120 ? 8 : 1) {
        const [px, py] = toPx(caminho[i][0], caminho[i][1]);
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Partida (anel) e posição atual (disco)
      const [ix, iy] = toPx(inicio[0], inicio[1]);
      ctx.strokeStyle = palette.fg;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ix, iy, 10, 0, Math.PI * 2);
      ctx.stroke();
      const ultimo = caminho[caminho.length - 1];
      const [ux, uy] = toPx(ultimo[0], ultimo[1]);
      ctx.fillStyle = palette.bg;
      ctx.beginPath();
      ctx.arc(ux, uy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.b;
      ctx.beginPath();
      ctx.arc(ux, uy, 9, 0, Math.PI * 2);
      ctx.fill();

      // Curva de perda (eixo y em log10)
      const W = closs.width;
      const H = closs.height;
      const m = { l: 86, r: 24, t: 22, b: 52 };
      lctx.fillStyle = palette.card;
      lctx.fillRect(0, 0, W, H);
      const logs = perdas.map((p) => Math.log10(Math.max(p, 1e-8)));
      const lo = Math.floor(Math.min(...logs));
      const hi = Math.max(lo + 1, Math.ceil(Math.max(...logs)));
      const xs = (i: number) => m.l + (i / MAX_PASSOS) * (W - m.l - m.r);
      const ys = (v: number) => m.t + ((hi - v) / (hi - lo)) * (H - m.t - m.b);
      lctx.font = "500 18px ui-monospace, monospace";
      lctx.textBaseline = "middle";
      lctx.textAlign = "right";
      const salto = Math.max(1, Math.ceil((hi - lo) / 5));
      for (let e = lo; e <= hi; e += salto) {
        lctx.strokeStyle = palette.grid;
        lctx.lineWidth = 1;
        lctx.beginPath();
        lctx.moveTo(m.l, ys(e));
        lctx.lineTo(W - m.r, ys(e));
        lctx.stroke();
        lctx.fillStyle = palette.muted;
        lctx.fillText(`1e${e}`, m.l - 10, ys(e));
      }
      lctx.textAlign = "center";
      lctx.textBaseline = "top";
      for (let i = 0; i <= MAX_PASSOS; i += 100) {
        lctx.fillText(String(i), xs(i), H - m.b + 10);
      }
      lctx.fillText("iteração", (m.l + W - m.r) / 2, H - 22);
      lctx.strokeStyle = palette.b;
      lctx.lineWidth = 3;
      lctx.lineJoin = "round";
      lctx.beginPath();
      logs.forEach((v, i) => {
        if (i === 0) lctx.moveTo(xs(i), ys(v));
        else lctx.lineTo(xs(i), ys(v));
      });
      lctx.stroke();
      lctx.fillStyle = palette.b;
      lctx.beginPath();
      lctx.arc(xs(logs.length - 1), ys(logs[logs.length - 1]), 6, 0, Math.PI * 2);
      lctx.fill();

      if (readoutRef.current) {
        const estado = divergiu
          ? "divergiu: a taxa de aprendizado é alta demais para esta curvatura"
          : t >= MAX_PASSOS
            ? "parou no limite de iterações"
            : gnorm < 1e-4 && t > 0
              ? "convergiu"
              : "descendo";
        readoutRef.current.textContent =
          `t = ${t} · (x, y) = (${ultimo[0].toFixed(3)}, ${ultimo[1].toFixed(3)}) · ` +
          `f = ${sci(perdas[perdas.length - 1])} · ‖∇f‖ = ${sci(gnorm)} · ${estado}`;
      }
    };

    const acabou = () => divergiu || t >= MAX_PASSOS || (t > 0 && gnorm < 1e-4);

    if (prefersReducedMotion() || !visible) {
      // Sem animação: calcula a trajetória inteira de uma vez
      while (!acabou()) passo();
      desenhar();
      return;
    }
    let raf = 0;
    const loop = () => {
      for (let k = 0; k < 2 && !acabou(); k++) passo();
      desenhar();
      if (!acabou()) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [palette, visible, fnId, opt, logLr, inicio, rodada]);

  return (
    <div ref={rootRef}>
      <Controles>
        <Segmented<FuncaoId>
          label="Superfície"
          value={fnId}
          onChange={trocarFuncao}
          options={(Object.keys(FUNCOES) as FuncaoId[]).map((id) => ({
            value: id,
            label: FUNCOES[id].label,
          }))}
        />
        <Segmented<Otimizador>
          label="Otimizador"
          value={opt}
          onChange={setOpt}
          options={[
            { value: "gd", label: "GD" },
            { value: "momento", label: "Momento" },
            { value: "adam", label: "Adam" },
          ]}
        />
        <Slider
          label="Taxa de aprendizado"
          value={logLr}
          min={-4}
          max={0}
          step={0.02}
          onChange={setLogLr}
          display={`η = ${lr < 0.01 ? lr.toExponential(1).replace(".", ",") : lr.toFixed(3).replace(".", ",")}`}
        />
        <LabButton onClick={() => setRodada((r) => r + 1)} primary>
          Soltar de novo
        </LabButton>
      </Controles>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Painel titulo="Curvas de nível: clique para escolher a partida">
          <canvas
            ref={mapRef}
            width={VIEW}
            height={VIEW}
            className={`${canvasClass} cursor-crosshair`}
            onPointerDown={escolherInicio}
            aria-label="Mapa de níveis da função. Clique para definir o ponto inicial da descida."
          />
          <p className="text-xs text-muted-foreground">
            Mais claro = valor menor. × marca os mínimos; o anel, a partida.
          </p>
        </Painel>
        <div className="min-w-0 flex flex-col gap-6">
          <Painel titulo="Valor da função a cada iteração (escala log)">
            <canvas
              ref={lossRef}
              width={720}
              height={380}
              className={canvasClass}
              aria-label="Valor da função ao longo das iterações."
            />
          </Painel>
          <p
            ref={readoutRef}
            aria-live="off"
            className="text-sm tabular-nums leading-relaxed border-l-2 border-primary pl-4"
          />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <Formula block tex={fn.tex} />
            <Formula block tex={String.raw`\theta_{t+1} = \theta_t - \eta\, \nabla f(\theta_t)`} />
            {fnId === "vale" && (
              <p className="mt-2">
                Aqui a maior curvatura é 12, então o GD puro só converge se{" "}
                <Formula tex={String.raw`\eta < 2/12 \approx 0{,}167`} />. Suba η devagar até
                passar desse valor e veja o zigue-zague virar divergência.
              </p>
            )}
            {fnId === "rosenbrock" && (
              <p className="mt-2">
                O fundo do vale é curvo e quase plano. O GD chega rápido ao vale e depois rasteja;
                compare com Momento e Adam usando a mesma partida.
              </p>
            )}
            {fnId === "himmelblau" && (
              <p className="mt-2">
                Com quatro mínimos, o destino depende de onde a descida começa. Clique em regiões
                diferentes do mapa.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
