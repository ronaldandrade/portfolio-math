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
  gauss,
  hexToRgb,
  mixRgb,
  mulberry32,
  prefersReducedMotion,
  useLabPalette,
  useOnScreen,
} from "./shared";

type DatasetId = "circulos" | "xor" | "luas" | "espiral";
type Ativacao = "tanh" | "relu";

interface Amostra {
  x: number;
  y: number;
  /** Classe 0 ou 1. */
  c: number;
}

interface Rede {
  sizes: number[];
  /** W[l][j * nIn + i]: peso do neurônio i da camada l para o j da camada l+1. */
  W: Float64Array[];
  b: Float64Array[];
  mW: Float64Array[];
  vW: Float64Array[];
  mb: Float64Array[];
  vb: Float64Array[];
  t: number;
  epoca: number;
  perdas: number[];
  acc: number;
}

const VIEW = 640;
const GRID = 64; // resolução do mapa de decisão
const N_AMOSTRAS = 200;
const MAX_EPOCAS = 2000;

/** Gera o conjunto de dados 2D em [-1, 1]². */
function gerarDados(id: DatasetId): Amostra[] {
  const rng = mulberry32(42);
  const out: Amostra[] = [];
  for (let i = 0; i < N_AMOSTRAS; i++) {
    const c = i % 2;
    if (id === "circulos") {
      const r = c === 0 ? rng() * 0.35 : 0.62 + rng() * 0.25;
      const a = rng() * Math.PI * 2;
      out.push({ x: r * Math.cos(a), y: r * Math.sin(a), c });
    } else if (id === "xor") {
      const x = (0.1 + rng() * 0.8) * (rng() < 0.5 ? -1 : 1);
      const y = (0.1 + rng() * 0.8) * (c === 0 ? Math.sign(x) : -Math.sign(x));
      out.push({ x, y, c });
    } else if (id === "luas") {
      const a = rng() * Math.PI;
      const ruido = 0.07;
      if (c === 0) {
        out.push({ x: Math.cos(a) * 0.6 - 0.3 + gauss(rng) * ruido, y: Math.sin(a) * 0.6 - 0.15 + gauss(rng) * ruido, c });
      } else {
        out.push({ x: 0.3 - Math.cos(a) * 0.6 + gauss(rng) * ruido, y: 0.15 - Math.sin(a) * 0.6 + gauss(rng) * ruido, c });
      }
    } else {
      const s = rng();
      const a = s * 1.6 * Math.PI * 2 + (c === 0 ? 0 : Math.PI);
      const r = 0.1 + s * 0.8;
      out.push({ x: r * Math.cos(a) + gauss(rng) * 0.02, y: r * Math.sin(a) + gauss(rng) * 0.02, c });
    }
  }
  return out;
}

/** Cria a rede com inicialização uniforme de Glorot. */
function criarRede(sizes: number[], seed: number): Rede {
  const rng = mulberry32(seed);
  const W: Float64Array[] = [];
  const b: Float64Array[] = [];
  for (let l = 0; l < sizes.length - 1; l++) {
    const lim = Math.sqrt(6 / (sizes[l] + sizes[l + 1]));
    W.push(Float64Array.from({ length: sizes[l] * sizes[l + 1] }, () => (rng() * 2 - 1) * lim));
    b.push(new Float64Array(sizes[l + 1]));
  }
  const zeros = (ref: Float64Array[]) => ref.map((a) => new Float64Array(a.length));
  return { sizes, W, b, mW: zeros(W), vW: zeros(W), mb: zeros(b), vb: zeros(b), t: 0, epoca: 0, perdas: [], acc: 0 };
}

/** Propagação direta; preenche `acts` (uma ativação por camada) e devolve P(classe 1). */
function forward(rede: Rede, x: number, y: number, ativ: Ativacao, acts: Float64Array[]): number {
  acts[0][0] = x;
  acts[0][1] = y;
  const L = rede.sizes.length - 1;
  for (let l = 0; l < L; l++) {
    const nIn = rede.sizes[l];
    const nOut = rede.sizes[l + 1];
    const a = acts[l];
    const o = acts[l + 1];
    for (let j = 0; j < nOut; j++) {
      let z = rede.b[l][j];
      for (let i = 0; i < nIn; i++) z += rede.W[l][j * nIn + i] * a[i];
      if (l === L - 1) o[j] = 1 / (1 + Math.exp(-z));
      else o[j] = ativ === "tanh" ? Math.tanh(z) : Math.max(0, z);
    }
  }
  return acts[L][0];
}

/** Uma época de gradiente em lote completo com Adam (entropia cruzada binária). */
function treinarEpoca(rede: Rede, dados: Amostra[], lr: number, ativ: Ativacao): void {
  const L = rede.sizes.length - 1;
  const acts = rede.sizes.map((n) => new Float64Array(n));
  const deltas = rede.sizes.map((n) => new Float64Array(n));
  const gW = rede.W.map((w) => new Float64Array(w.length));
  const gb = rede.b.map((v) => new Float64Array(v.length));
  let perda = 0;
  let acertos = 0;

  for (const s of dados) {
    const p = forward(rede, s.x, s.y, ativ, acts);
    perda -= s.c === 1 ? Math.log(p + 1e-12) : Math.log(1 - p + 1e-12);
    if ((p > 0.5 ? 1 : 0) === s.c) acertos++;
    deltas[L][0] = p - s.c; // sigmoide + entropia cruzada
    for (let l = L - 1; l >= 0; l--) {
      const nIn = rede.sizes[l];
      const nOut = rede.sizes[l + 1];
      const d = deltas[l + 1];
      for (let j = 0; j < nOut; j++) {
        gb[l][j] += d[j];
        for (let i = 0; i < nIn; i++) gW[l][j * nIn + i] += d[j] * acts[l][i];
      }
      if (l > 0) {
        for (let i = 0; i < nIn; i++) {
          let soma = 0;
          for (let j = 0; j < nOut; j++) soma += rede.W[l][j * nIn + i] * d[j];
          const a = acts[l][i];
          deltas[l][i] = soma * (ativ === "tanh" ? 1 - a * a : a > 0 ? 1 : 0);
        }
      }
    }
  }

  rede.t += 1;
  const c1 = 1 - 0.9 ** rede.t;
  const c2 = 1 - 0.999 ** rede.t;
  const n = dados.length;
  const adam = (theta: Float64Array, g: Float64Array, m: Float64Array, v: Float64Array) => {
    for (let k = 0; k < theta.length; k++) {
      const gk = g[k] / n;
      m[k] = 0.9 * m[k] + 0.1 * gk;
      v[k] = 0.999 * v[k] + 0.001 * gk * gk;
      theta[k] -= (lr * (m[k] / c1)) / (Math.sqrt(v[k] / c2) + 1e-8);
    }
  };
  for (let l = 0; l < L; l++) {
    adam(rede.W[l], gW[l], rede.mW[l], rede.vW[l]);
    adam(rede.b[l], gb[l], rede.mb[l], rede.vb[l]);
  }
  rede.epoca += 1;
  rede.perdas.push(perda / n);
  rede.acc = acertos / n;
}

/**
 * Rede neural treinando no navegador: a fronteira de decisão, os pesos e a
 * perda são redesenhados a cada quadro.
 */
export default function NeuralLab() {
  const palette = useLabPalette();
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(rootRef);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const netRef = useRef<HTMLCanvasElement>(null);
  const lossRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLParagraphElement>(null);
  const redeRef = useRef<Rede | null>(null);

  const [dataset, setDataset] = useState<DatasetId>("circulos");
  const [camadas, setCamadas] = useState(2);
  const [neuronios, setNeuronios] = useState(6);
  const [ativ, setAtiv] = useState<Ativacao>("tanh");
  const [logLr, setLogLr] = useState(-1.5);
  const [rodando, setRodando] = useState(true);
  const [rodada, setRodada] = useState(0);

  const lr = 10 ** logLr;
  const nParams = (() => {
    const sizes = [2, ...Array<number>(camadas).fill(neuronios), 1];
    let total = 0;
    for (let l = 0; l < sizes.length - 1; l++) total += sizes[l] * sizes[l + 1] + sizes[l + 1];
    return total;
  })();

  // (Re)cria a rede quando a arquitetura, os dados ou a rodada mudam
  useEffect(() => {
    redeRef.current = criarRede([2, ...Array<number>(camadas).fill(neuronios), 1], 7 + rodada);
  }, [dataset, camadas, neuronios, ativ, rodada]);

  useEffect(() => {
    const cmap = mapRef.current;
    const cnet = netRef.current;
    const closs = lossRef.current;
    const rede = redeRef.current;
    if (!cmap || !cnet || !closs || !rede) return;
    const ctx = cmap.getContext("2d");
    const nctx = cnet.getContext("2d");
    const lctx = closs.getContext("2d");
    if (!ctx || !nctx || !lctx) return;

    const dados = gerarDados(dataset);
    const taxa = 10 ** logLr;
    const acts = rede.sizes.map((n) => new Float64Array(n));
    const heat = document.createElement("canvas");
    heat.width = heat.height = GRID;
    const hctx = heat.getContext("2d")!;
    const himg = hctx.createImageData(GRID, GRID);
    const bg = hexToRgb(palette.bg);
    const corA = hexToRgb(palette.a);
    const corB = hexToRgb(palette.b);
    const toPx = (v: number) => ((v + 1.1) / 2.2) * VIEW;

    const desenhar = () => {
      // Mapa de decisão: neutro em p = 0,5, cor da classe nos extremos
      for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
          const x = -1.1 + ((i + 0.5) / GRID) * 2.2;
          const y = 1.1 - ((j + 0.5) / GRID) * 2.2;
          const p = forward(rede, x, y, ativ, acts);
          const c = mixRgb(bg, p > 0.5 ? corB : corA, Math.abs(2 * p - 1) * 0.6);
          const k = (j * GRID + i) * 4;
          himg.data[k] = c[0];
          himg.data[k + 1] = c[1];
          himg.data[k + 2] = c[2];
          himg.data[k + 3] = 255;
        }
      }
      hctx.putImageData(himg, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(heat, 0, 0, VIEW, VIEW);

      // Amostras: classe 0 = círculo, classe 1 = quadrado
      for (const s of dados) {
        const px = toPx(s.x);
        const py = VIEW - toPx(s.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = palette.bg;
        ctx.fillStyle = s.c === 0 ? palette.a : palette.b;
        ctx.beginPath();
        if (s.c === 0) ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        else ctx.rect(px - 6, py - 6, 12, 12);
        ctx.fill();
        ctx.stroke();
      }

      // Diagrama da rede: espessura = |peso|, tracejado = peso negativo
      const W = cnet.width;
      const H = cnet.height;
      nctx.fillStyle = palette.card;
      nctx.fillRect(0, 0, W, H);
      const L = rede.sizes.length;
      const pos = (l: number, i: number): [number, number] => [
        60 + (l / (L - 1)) * (W - 120),
        H / 2 + (i - (rede.sizes[l] - 1) / 2) * Math.min(38, (H - 50) / rede.sizes[l]),
      ];
      for (let l = 0; l < L - 1; l++) {
        const nIn = rede.sizes[l];
        for (let j = 0; j < rede.sizes[l + 1]; j++) {
          for (let i = 0; i < nIn; i++) {
            const w = rede.W[l][j * nIn + i];
            const [xa, ya] = pos(l, i);
            const [xb, yb] = pos(l + 1, j);
            nctx.strokeStyle = palette.fg;
            nctx.globalAlpha = 0.25 + Math.min(0.65, Math.abs(w) * 0.3);
            nctx.lineWidth = Math.min(7, 0.6 + Math.abs(w) * 1.8);
            nctx.setLineDash(w < 0 ? [7, 6] : []);
            nctx.beginPath();
            nctx.moveTo(xa, ya);
            nctx.lineTo(xb, yb);
            nctx.stroke();
          }
        }
      }
      nctx.setLineDash([]);
      nctx.globalAlpha = 1;
      for (let l = 0; l < L; l++) {
        for (let i = 0; i < rede.sizes[l]; i++) {
          const [x, y] = pos(l, i);
          nctx.fillStyle = palette.card;
          nctx.strokeStyle = palette.fg;
          nctx.lineWidth = 2.5;
          nctx.beginPath();
          nctx.arc(x, y, 12, 0, Math.PI * 2);
          nctx.fill();
          nctx.stroke();
        }
      }
      nctx.fillStyle = palette.muted;
      nctx.font = "500 17px ui-monospace, monospace";
      nctx.textAlign = "center";
      nctx.textBaseline = "alphabetic";
      nctx.fillText("x, y", 60, H - 12);
      nctx.fillText("P(classe B)", W - 80, H - 12);

      // Curva de perda
      const LW = closs.width;
      const LH = closs.height;
      const m = { l: 70, r: 24, t: 20, b: 50 };
      lctx.fillStyle = palette.card;
      lctx.fillRect(0, 0, LW, LH);
      const perdas = rede.perdas;
      const maxX = Math.max(100, Math.ceil(perdas.length / 100) * 100);
      const maxY = 0.8;
      const xs = (i: number) => m.l + (i / maxX) * (LW - m.l - m.r);
      const ys = (v: number) => m.t + (1 - Math.min(v, maxY) / maxY) * (LH - m.t - m.b);
      lctx.font = "500 17px ui-monospace, monospace";
      lctx.textAlign = "right";
      lctx.textBaseline = "middle";
      for (const v of [0, 0.2, 0.4, 0.6, 0.8]) {
        lctx.strokeStyle = palette.grid;
        lctx.lineWidth = 1;
        lctx.beginPath();
        lctx.moveTo(m.l, ys(v));
        lctx.lineTo(LW - m.r, ys(v));
        lctx.stroke();
        lctx.fillStyle = palette.muted;
        lctx.fillText(v.toFixed(1).replace(".", ","), m.l - 10, ys(v));
      }
      lctx.textAlign = "center";
      lctx.textBaseline = "top";
      lctx.fillText("0", xs(0), LH - m.b + 8);
      lctx.fillText(String(maxX), xs(maxX), LH - m.b + 8);
      lctx.fillText("época", (m.l + LW - m.r) / 2, LH - m.b + 8);
      if (perdas.length > 1) {
        lctx.strokeStyle = palette.fg;
        lctx.lineWidth = 3;
        lctx.lineJoin = "round";
        lctx.beginPath();
        perdas.forEach((v, i) => {
          if (i === 0) lctx.moveTo(xs(i), ys(v));
          else lctx.lineTo(xs(i), ys(v));
        });
        lctx.stroke();
        lctx.fillStyle = palette.fg;
        lctx.beginPath();
        lctx.arc(xs(perdas.length - 1), ys(perdas[perdas.length - 1]), 6, 0, Math.PI * 2);
        lctx.fill();
      }

      if (readoutRef.current) {
        const perda = perdas.length ? perdas[perdas.length - 1].toFixed(4).replace(".", ",") : "–";
        readoutRef.current.textContent =
          `época ${rede.epoca} · perda ${perda} · acurácia ${(rede.acc * 100).toFixed(1).replace(".", ",")}%` +
          (rede.epoca >= MAX_EPOCAS ? " · limite de épocas atingido" : "");
      }
    };

    if (!rodando || !visible) {
      desenhar();
      return;
    }
    if (prefersReducedMotion()) {
      while (rede.epoca < 400) treinarEpoca(rede, dados, taxa, ativ);
      desenhar();
      return;
    }
    let raf = 0;
    const loop = () => {
      for (let k = 0; k < 4 && rede.epoca < MAX_EPOCAS; k++) treinarEpoca(rede, dados, taxa, ativ);
      desenhar();
      if (rede.epoca < MAX_EPOCAS) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [palette, visible, dataset, camadas, neuronios, ativ, logLr, rodando, rodada]);

  return (
    <div ref={rootRef}>
      <Controles>
        <Segmented<DatasetId>
          label="Dados"
          value={dataset}
          onChange={setDataset}
          options={[
            { value: "circulos", label: "Círculos" },
            { value: "xor", label: "XOR" },
            { value: "luas", label: "Luas" },
            { value: "espiral", label: "Espiral" },
          ]}
        />
        <Segmented<Ativacao>
          label="Ativação"
          value={ativ}
          onChange={setAtiv}
          options={[
            { value: "tanh", label: "tanh" },
            { value: "relu", label: "ReLU" },
          ]}
        />
        <Slider label="Camadas ocultas" value={camadas} min={1} max={3} step={1} onChange={setCamadas} display={String(camadas)} />
        <Slider label="Neurônios por camada" value={neuronios} min={1} max={8} step={1} onChange={setNeuronios} display={String(neuronios)} />
        <Slider
          label="Taxa de aprendizado"
          value={logLr}
          min={-3}
          max={-0.5}
          step={0.05}
          onChange={setLogLr}
          display={`η = ${lr.toFixed(lr < 0.01 ? 4 : 3).replace(".", ",")}`}
        />
        <div className="flex gap-1.5">
          <LabButton onClick={() => setRodando(!rodando)} primary>
            {rodando ? "Pausar" : "Treinar"}
          </LabButton>
          <LabButton onClick={() => setRodada((r) => r + 1)}>Reiniciar pesos</LabButton>
        </div>
      </Controles>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Painel titulo="Fronteira de decisão">
          <canvas
            ref={mapRef}
            width={VIEW}
            height={VIEW}
            className={canvasClass}
            aria-label="Mapa da probabilidade prevista pela rede, com as amostras de treino por cima."
          />
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[#008a80] dark:bg-[#2ea198]" aria-hidden="true" />
              Classe A (círculos)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-[#c9652b] dark:bg-[#cc7a38]" aria-hidden="true" />
              Classe B (quadrados)
            </li>
            <li>Fundo: classe prevista; quanto mais forte, mais confiante.</li>
          </ul>
        </Painel>
        <div className="min-w-0 flex flex-col gap-6">
          <Painel titulo={`Rede: ${nParams} parâmetros (traço = |peso|, tracejado = negativo)`}>
            <canvas ref={netRef} width={720} height={330} className={canvasClass} aria-label="Diagrama da rede com a intensidade dos pesos." />
          </Painel>
          <Painel titulo="Perda (entropia cruzada) por época">
            <canvas ref={lossRef} width={720} height={300} className={canvasClass} aria-label="Curva de perda durante o treino." />
          </Painel>
          <p ref={readoutRef} className="text-sm tabular-nums border-l-2 border-primary pl-4" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <Formula
              block
              tex={String.raw`\mathcal{L} = -\frac{1}{n}\sum_{i=1}^{n} \Big[\, y_i \log \hat{y}_i + (1-y_i)\log(1-\hat{y}_i) \Big]`}
            />
            <p className="mt-2">
              Teste a espiral com 1 camada de 2 neurônios e depois com 3 camadas de 8. Com 1
              neurônio a fronteira é sempre uma reta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
