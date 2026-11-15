"use client";

import { useEffect, useRef, useState } from "react";
import {
  Controles,
  Formula,
  LabButton,
  Painel,
  Slider,
  canvasClass,
  drawScene,
  relPos,
} from "./shared";

/** Caixa em coordenadas normalizadas [0, 1] da imagem. */
interface Caixa {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Arrasto =
  | { alvo: "pred" | "gt"; modo: "mover"; dx: number; dy: number }
  | { alvo: "pred"; modo: "redimensionar" }
  | null;

const VIEW = 640;
const GT_INICIAL: Caixa = { x: 0.612, y: 0.441, w: 0.2, h: 0.2 };
const PRED_INICIAL: Caixa = { x: 0.665, y: 0.39, w: 0.23, h: 0.21 };

/** Área da interseção de duas caixas. */
function intersecao(a: Caixa, b: Caixa): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

const dentro = (c: Caixa, u: number, v: number) =>
  u >= c.x && u <= c.x + c.w && v >= c.y && v <= c.y + c.h;

const pct = (v: number) => `${(v * 100).toFixed(1).replace(".", ",")}%`;

/**
 * Interseção sobre união: arraste a predição sobre a anotação e veja quando
 * a detecção passa a contar como acerto.
 */
export default function IouLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrasto = useRef<Arrasto>(null);

  const [gt, setGt] = useState<Caixa>(GT_INICIAL);
  const [pred, setPred] = useState<Caixa>(PRED_INICIAL);
  const [limiar, setLimiar] = useState(0.5);

  const inter = intersecao(gt, pred);
  const uniao = gt.w * gt.h + pred.w * pred.h - inter;
  const iou = uniao > 0 ? inter / uniao : 0;
  const acerto = iou >= limiar;

  const aoPressionar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { u, v } = relPos(e, e.currentTarget);
    const alca = Math.hypot(u - (pred.x + pred.w), v - (pred.y + pred.h)) < 0.05;
    if (alca) arrasto.current = { alvo: "pred", modo: "redimensionar" };
    else if (dentro(pred, u, v)) arrasto.current = { alvo: "pred", modo: "mover", dx: u - pred.x, dy: v - pred.y };
    else if (dentro(gt, u, v)) arrasto.current = { alvo: "gt", modo: "mover", dx: u - gt.x, dy: v - gt.y };
    else return;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const aoMover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const a = arrasto.current;
    if (!a) return;
    const { u, v } = relPos(e, e.currentTarget);
    if (a.modo === "redimensionar") {
      setPred({ ...pred, w: Math.max(0.05, u - pred.x), h: Math.max(0.05, v - pred.y) });
      return;
    }
    const base = a.alvo === "pred" ? pred : gt;
    const nova = {
      ...base,
      x: Math.min(1 - base.w, Math.max(0, u - a.dx)),
      y: Math.min(1 - base.h, Math.max(0, v - a.dy)),
    };
    if (a.alvo === "pred") setPred(nova);
    else setGt(nova);
  };

  const aoSoltar = () => {
    arrasto.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawScene(ctx, VIEW, 0.6);
    // Esmaece a cena para as caixas se destacarem
    ctx.fillStyle = "rgba(20,24,28,0.28)";
    ctx.fillRect(0, 0, VIEW, VIEW);

    const px = (c: Caixa): [number, number, number, number] => [c.x * VIEW, c.y * VIEW, c.w * VIEW, c.h * VIEW];

    // Interseção
    const ix = Math.max(gt.x, pred.x);
    const iy = Math.max(gt.y, pred.y);
    const iw = Math.min(gt.x + gt.w, pred.x + pred.w) - ix;
    const ih = Math.min(gt.y + gt.h, pred.y + pred.h) - iy;
    if (iw > 0 && ih > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillRect(ix * VIEW, iy * VIEW, iw * VIEW, ih * VIEW);
    }

    const caixa = (c: Caixa, cor: string, nome: string, tracejada: boolean, acima: boolean) => {
      const [x, y, w, h] = px(c);
      ctx.setLineDash(tracejada ? [12, 7] : []);
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(x, y, w, h);
      ctx.lineWidth = 4;
      ctx.strokeStyle = cor;
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      ctx.font = "600 19px ui-monospace, monospace";
      const tw = ctx.measureText(nome).width + 16;
      const ly = acima ? Math.max(0, y - 30) : Math.min(VIEW - 28, y + h + 2);
      ctx.fillStyle = cor;
      ctx.fillRect(x, ly, tw, 28);
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(nome, x + 8, ly + 15);
    };
    caixa(gt, "#008a80", "anotação", false, false);
    caixa(pred, "#c9652b", "predição", true, true);

    // Alça de redimensionar da predição
    const hx = (pred.x + pred.w) * VIEW;
    const hy = (pred.y + pred.h) * VIEW;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#c9652b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(hx - 9, hy - 9, 18, 18);
    ctx.fill();
    ctx.stroke();
  }, [gt, pred]);

  return (
    <div>
      <Controles>
        <Slider
          label="Limiar de IoU"
          value={limiar}
          min={0.1}
          max={0.95}
          step={0.05}
          onChange={setLimiar}
          display={limiar.toFixed(2).replace(".", ",")}
        />
        <LabButton
          onClick={() => {
            setGt(GT_INICIAL);
            setPred(PRED_INICIAL);
          }}
        >
          Voltar ao início
        </LabButton>
      </Controles>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Painel titulo="Arraste as caixas; puxe o canto da predição">
          <canvas
            ref={canvasRef}
            width={VIEW}
            height={VIEW}
            className={`${canvasClass} cursor-move`}
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={aoSoltar}
            aria-label="Cena com a caixa anotada e a caixa prevista pelo detector. Arraste para mover e redimensionar."
          />
        </Painel>

        <div className="min-w-0 flex flex-col gap-6 text-sm">
          <div className="border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">IoU</p>
            <p className="lab-mono text-5xl md:text-6xl font-semibold mt-1">{iou.toFixed(3).replace(".", ",")}</p>
            <p className="mt-3 font-medium">
              {acerto ? "✓ Verdadeiro positivo" : "✕ Falso positivo"}
              <span className="font-normal text-muted-foreground">
                {" "}
                com limiar {limiar.toFixed(2).replace(".", ",")}
              </span>
            </p>
          </div>

          <table className="w-full lab-mono border-t border-border">
            <tbody>
              {[
                ["Área da anotação", pct(gt.w * gt.h)],
                ["Área da predição", pct(pred.w * pred.h)],
                ["Interseção", pct(inter)],
                ["União", pct(uniao)],
              ].map(([nome, valor]) => (
                <tr key={nome} className="border-b border-border">
                  <th scope="row" className="py-2.5 pr-4 text-left font-medium text-muted-foreground">
                    {nome}
                  </th>
                  <td className="py-2.5 text-right">{valor} da imagem</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-muted-foreground leading-relaxed">
            <Formula
              block
              tex={String.raw`\mathrm{IoU}(A, B) = \frac{|A \cap B|}{|A \cup B|} = \frac{|A \cap B|}{|A| + |B| - |A \cap B|}`}
            />
            <p className="mt-2">
              Deslocar a predição em meia largura já derruba a IoU para perto de 0,33. Por isso o
              mAP@0,5 perdoa caixas frouxas e o mAP@0,5:0,95 não.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
