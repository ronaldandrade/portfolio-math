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
  mulberry32,
  relPos,
  useLabPalette,
} from "./shared";

type Ponto = [number, number];

const VIEW = 640;
const LIM = 4; // o plano mostrado é [-LIM, LIM]²
const N_PONTOS = 40;

/** Nuvem gaussiana 2D com correlação ρ entre x e y. */
function gerarNuvem(rho: number, seed: number): Ponto[] {
  const rng = mulberry32(seed);
  return Array.from({ length: N_PONTOS }, (): Ponto => {
    const z1 = gauss(rng);
    const z2 = gauss(rng);
    // Arredonda para o servidor e o navegador gerarem exatamente a mesma nuvem
    const r4 = (v: number) => Math.round(v * 1e4) / 1e4;
    return [r4(1.3 * z1), r4(1.3 * (rho * z1 + Math.sqrt(1 - rho * rho) * z2))];
  });
}

interface Pca {
  media: Ponto;
  /** Covariância amostral [[sxx, sxy], [sxy, syy]]. */
  sxx: number;
  sxy: number;
  syy: number;
  l1: number;
  l2: number;
  v1: Ponto;
  v2: Ponto;
}

/** PCA em 2D: autovalores e autovetores da covariância por fórmula fechada. */
function pca(pontos: Ponto[]): Pca {
  const n = pontos.length;
  const mx = pontos.reduce((s, p) => s + p[0], 0) / n;
  const my = pontos.reduce((s, p) => s + p[1], 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const [x, y] of pontos) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
    syy += (y - my) ** 2;
  }
  sxx /= n - 1;
  sxy /= n - 1;
  syy /= n - 1;
  const meio = (sxx + syy) / 2;
  const raiz = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy * sxy);
  const l1 = meio + raiz;
  const l2 = Math.max(0, meio - raiz);
  let v1: Ponto = Math.abs(sxy) > 1e-9 ? [sxy, l1 - sxx] : sxx >= syy ? [1, 0] : [0, 1];
  const norma = Math.hypot(v1[0], v1[1]);
  v1 = [v1[0] / norma, v1[1] / norma];
  if (v1[0] < 0) v1 = [-v1[0], -v1[1]];
  return { media: [mx, my], sxx, sxy, syy, l1, l2, v1, v2: [-v1[1], v1[0]] };
}

const num = (v: number, casas = 2) => v.toFixed(casas).replace(".", ",");

/**
 * PCA com pontos arrastáveis: os componentes principais giram e mudam de
 * tamanho conforme a nuvem muda.
 */
export default function PcaLab() {
  const palette = useLabPalette();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrastando = useRef<number | null>(null);

  const [rho, setRho] = useState(0.8);
  const [seed, setSeed] = useState(11);
  const [pontos, setPontos] = useState<Ponto[]>(() => gerarNuvem(0.8, 11));
  const [proj, setProj] = useState<"sim" | "nao">("sim");

  const r = pca(pontos);
  const explicado = r.l1 / (r.l1 + r.l2 || 1);

  const mudarRho = (v: number) => {
    setRho(v);
    setPontos(gerarNuvem(v, seed));
  };

  const novaAmostra = () => {
    setSeed(seed + 1);
    setPontos(gerarNuvem(rho, seed + 1));
  };

  /** Converte a posição do ponteiro para coordenadas do plano. */
  const paraPlano = (e: React.PointerEvent<HTMLCanvasElement>): Ponto => {
    const { u, v } = relPos(e, e.currentTarget);
    return [(u * 2 - 1) * LIM, (1 - v * 2) * LIM];
  };

  const aoPressionar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = paraPlano(e);
    let melhor = -1;
    let dist = 0.45; // raio de captura, em unidades do plano
    pontos.forEach((p, i) => {
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < dist) {
        dist = d;
        melhor = i;
      }
    });
    if (melhor >= 0) {
      arrastando.current = melhor;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const aoMover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const i = arrastando.current;
    if (i === null) return;
    const p = paraPlano(e);
    setPontos(pontos.map((q, j) => (j === i ? p : q)));
  };

  const aoSoltar = () => {
    arrastando.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const res = pca(pontos);
    const X = (x: number) => ((x + LIM) / (2 * LIM)) * VIEW;
    const Y = (y: number) => ((LIM - y) / (2 * LIM)) * VIEW;

    ctx.fillStyle = palette.card;
    ctx.fillRect(0, 0, VIEW, VIEW);

    // Grade e eixos
    ctx.lineWidth = 1;
    for (let k = -LIM; k <= LIM; k++) {
      ctx.strokeStyle = palette.grid;
      ctx.globalAlpha = k === 0 ? 1 : 0.45;
      ctx.beginPath();
      ctx.moveTo(X(k), 0);
      ctx.lineTo(X(k), VIEW);
      ctx.moveTo(0, Y(k));
      ctx.lineTo(VIEW, Y(k));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const [mx, my] = res.media;
    const s1 = 2 * Math.sqrt(res.l1);
    const s2 = 2 * Math.sqrt(res.l2);

    // Projeções de cada ponto sobre o PC1
    if (proj === "sim") {
      for (const [x, y] of pontos) {
        const t = (x - mx) * res.v1[0] + (y - my) * res.v1[1];
        const qx = mx + t * res.v1[0];
        const qy = my + t * res.v1[1];
        ctx.strokeStyle = palette.muted;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(X(x), Y(y));
        ctx.lineTo(X(qx), Y(qy));
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.a;
        ctx.beginPath();
        ctx.arc(X(qx), Y(qy), 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Componentes principais: comprimento = 2 desvios-padrão em cada direção
    const eixo = (v: Ponto, s: number, cor: string, nome: string) => {
      ctx.strokeStyle = cor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(X(mx - v[0] * s), Y(my - v[1] * s));
      ctx.lineTo(X(mx + v[0] * s), Y(my + v[1] * s));
      ctx.stroke();
      // Ponta da seta
      const ax = X(mx + v[0] * s);
      const ay = Y(my + v[1] * s);
      const ang = Math.atan2(-v[1], v[0]);
      ctx.fillStyle = cor;
      ctx.beginPath();
      ctx.moveTo(ax + 14 * Math.cos(ang), ay + 14 * Math.sin(ang));
      ctx.lineTo(ax + 9 * Math.cos(ang + 2.3), ay + 9 * Math.sin(ang + 2.3));
      ctx.lineTo(ax + 9 * Math.cos(ang - 2.3), ay + 9 * Math.sin(ang - 2.3));
      ctx.fill();
      ctx.fillStyle = palette.fg;
      ctx.font = "700 20px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lx = Math.min(VIEW - 30, Math.max(30, ax + 30 * Math.cos(ang)));
      const ly = Math.min(VIEW - 16, Math.max(16, ay + 30 * Math.sin(ang)));
      ctx.strokeStyle = palette.card;
      ctx.lineWidth = 6;
      ctx.lineJoin = "round";
      ctx.strokeText(nome, lx, ly);
      ctx.fillText(nome, lx, ly);
    };
    eixo(res.v2, s2, palette.b, "PC2");
    eixo(res.v1, s1, palette.a, "PC1");

    // Pontos
    for (const [x, y] of pontos) {
      ctx.fillStyle = palette.fg;
      ctx.strokeStyle = palette.card;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(X(x), Y(y), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Média
    ctx.strokeStyle = palette.fg;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(X(mx) - 9, Y(my));
    ctx.lineTo(X(mx) + 9, Y(my));
    ctx.moveTo(X(mx), Y(my) - 9);
    ctx.lineTo(X(mx), Y(my) + 9);
    ctx.stroke();
  }, [palette, pontos, proj]);

  return (
    <div>
      <Controles>
        <Slider label="Correlação da nuvem" value={rho} min={-0.95} max={0.95} step={0.05} onChange={mudarRho} display={`ρ = ${num(rho)}`} />
        <Segmented<"sim" | "nao">
          label="Projeções no PC1"
          value={proj}
          onChange={setProj}
          options={[
            { value: "sim", label: "Mostrar" },
            { value: "nao", label: "Ocultar" },
          ]}
        />
        <LabButton onClick={novaAmostra} primary>
          Nova amostra
        </LabButton>
      </Controles>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Painel titulo="Arraste qualquer ponto">
          <canvas
            ref={canvasRef}
            width={VIEW}
            height={VIEW}
            className={`${canvasClass} cursor-grab active:cursor-grabbing`}
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={aoSoltar}
            aria-label="Nuvem de pontos com os dois componentes principais. Arraste os pontos para ver os eixos mudarem."
          />
        </Painel>

        <div className="min-w-0 flex flex-col gap-6 text-sm">
          <div>
            <div className="flex justify-between text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
              <span>Variância explicada</span>
              <span className="tabular-nums text-foreground">
                PC1 {num(explicado * 100, 1)}% · PC2 {num((1 - explicado) * 100, 1)}%
              </span>
            </div>
            <div className="flex h-5 gap-0.5" role="img" aria-label={`PC1 explica ${num(explicado * 100, 1)} por cento da variância`}>
              <div className="bg-[#008a80] dark:bg-[#2ea198]" style={{ width: `${(explicado * 100).toFixed(1)}%` }} />
              <div className="bg-[#c9652b] dark:bg-[#cc7a38] flex-1" />
            </div>
          </div>

          <table className="w-full tabular-nums border-t border-border">
            <tbody>
              <tr className="border-b border-border">
                <th scope="row" className="py-2.5 pr-4 text-left font-medium text-muted-foreground">Covariância Σ</th>
                <td className="py-2.5 text-right">
                  [{num(r.sxx)}, {num(r.sxy)}; {num(r.sxy)}, {num(r.syy)}]
                </td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2.5 pr-4 text-left font-medium text-muted-foreground">Autovalores λ₁, λ₂</th>
                <td className="py-2.5 text-right">
                  {num(r.l1)} · {num(r.l2)}
                </td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2.5 pr-4 text-left font-medium text-muted-foreground">Direção do PC1</th>
                <td className="py-2.5 text-right">
                  ({num(r.v1[0])}, {num(r.v1[1])})
                </td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2.5 pr-4 text-left font-medium text-muted-foreground">Direção do PC2</th>
                <td className="py-2.5 text-right">
                  ({num(r.v2[0])}, {num(r.v2[1])})
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-muted-foreground leading-relaxed">
            <Formula
              block
              tex={String.raw`\Sigma = \frac{1}{n-1}\, X_c^{\top} X_c, \qquad \Sigma\, v_k = \lambda_k v_k, \qquad \frac{\lambda_1}{\lambda_1 + \lambda_2} = \text{variância explicada}`}
            />
            <p className="mt-2">
              Cada eixo tem comprimento de dois desvios-padrão (
              <Formula tex={String.raw`2\sqrt{\lambda_k}`} />
              ). Puxe um único ponto para longe e veja o PC1 girar atrás dele: o PCA é sensível a
              outliers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
