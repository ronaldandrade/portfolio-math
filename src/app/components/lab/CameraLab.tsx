"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Controles,
  Formula,
  LabButton,
  Painel,
  Segmented,
  Slider,
  canvasClass,
  drawScene,
  prefersReducedMotion,
  relPos,
  useLabPalette,
  useOnScreen,
} from "./shared";

type Fonte = "cena" | "upload" | "webcam";
type Modo = "rgb" | "cinza" | "r" | "g" | "b" | "bayer";

const RESOLUCOES = [8, 12, 16, 24, 32, 48, 64, 96] as const;
const SCENE = 384; // resolução da "luz contínua"
const VIEW = 640; // resolução interna dos painéis
const JANELA = 8; // lado da janela mostrada como matriz

const TINTA: Record<"r" | "g" | "b", [number, number, number]> = {
  r: [1, 0, 0],
  g: [0, 1, 0],
  b: [0, 0, 1],
};

/** Canal registrado pelo fotossítio (x, y) no mosaico de Bayer RGGB. */
function canalBayer(x: number, y: number): "r" | "g" | "b" {
  if (y % 2 === 0) return x % 2 === 0 ? "r" : "g";
  return x % 2 === 0 ? "g" : "b";
}

/** Formata uma contagem de bits como bytes legíveis. */
function tamanho(bits: number): string {
  const bytes = bits / 8;
  if (bytes < 1024) return `${Math.ceil(bytes)} bytes`;
  return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
}

/**
 * Da luz à matriz: amostra uma cena em N×N fotossítios, quantiza em b bits
 * e mostra os números que chegam ao programa.
 */
export default function CameraLab() {
  const palette = useLabPalette();
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(rootRef);

  const sceneRef = useRef<HTMLCanvasElement>(null);
  const sensorRef = useRef<HTMLCanvasElement>(null);
  const matrixRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const lastMsRef = useRef(600);

  const [fonte, setFonte] = useState<Fonte>("cena");
  const [imagem, setImagem] = useState<HTMLImageElement | null>(null);
  const [pausado, setPausado] = useState(false);
  const [resIdx, setResIdx] = useState(4);
  const [bits, setBits] = useState(8);
  const [modo, setModo] = useState<Modo>("rgb");
  const [sel, setSel] = useState({ u: 0.66, v: 0.6 });
  const [erro, setErro] = useState("");

  const n = RESOLUCOES[resIdx];
  const canais = modo === "rgb" ? 3 : 1;
  const totalNumeros = n * n * canais;

  /** Desliga a webcam, se estiver ligada. */
  const pararWebcam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      pararWebcam();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const usarCena = () => {
    pararWebcam();
    setErro("");
    setPausado(false);
    setFonte("cena");
  };

  const usarWebcam = async () => {
    setErro("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 } },
        audio: false,
      });
      pararWebcam();
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setPausado(false);
      setFonte("webcam");
    } catch {
      setErro("Não foi possível abrir a câmera. Libere a permissão no navegador e tente de novo.");
    }
  };

  const usarArquivo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      pararWebcam();
      setErro("");
      setPausado(false);
      setImagem(img);
      setFonte("upload");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setErro("Esse arquivo não abriu como imagem. Tente um JPG ou PNG.");
    };
    img.src = url;
    e.target.value = "";
  };

  useEffect(() => {
    const scene = sceneRef.current;
    const sensor = sensorRef.current;
    const matrix = matrixRef.current;
    if (!scene || !sensor || !matrix) return;
    const sctx = scene.getContext("2d");
    const nctx = sensor.getContext("2d");
    const mctx = matrix.getContext("2d");
    if (!sctx || !nctx || !mctx) return;

    // Canvas pequeno: cada pixel dele é um fotossítio do sensor
    const small = document.createElement("canvas");
    small.width = n;
    small.height = n;
    const smctx = small.getContext("2d", { willReadFrequently: true });
    if (!smctx) return;
    smctx.imageSmoothingQuality = "high";

    const niveis = 2 ** bits - 1;
    const w = Math.min(JANELA, n);
    const x0 = Math.min(n - w, Math.max(0, Math.floor(sel.u * n) - (w >> 1)));
    const y0 = Math.min(n - w, Math.max(0, Math.floor(sel.v * n) - (w >> 1)));

    /** Desenha a fonte recortada em quadrado (cover). */
    const drawCover = (src: CanvasImageSource, sw: number, sh: number) => {
      const side = Math.min(sw, sh);
      sctx.drawImage(src, (sw - side) / 2, (sh - side) / 2, side, side, 0, 0, SCENE, SCENE);
    };

    const frame = (ms: number, atualizarCena = true) => {
      // 1. Cena
      if (atualizarCena) {
        lastMsRef.current = ms;
        const video = videoRef.current;
        if (fonte === "webcam" && video && video.videoWidth > 0) {
          drawCover(video, video.videoWidth, video.videoHeight);
        } else if (fonte === "upload" && imagem) {
          drawCover(imagem, imagem.naturalWidth, imagem.naturalHeight);
        } else {
          drawScene(sctx, SCENE, ms / 1000);
        }
      }

      // 2. Amostragem (N×N) e quantização (b bits)
      smctx.drawImage(scene, 0, 0, n, n);
      const img = smctx.getImageData(0, 0, n, n);
      const d = img.data;
      const q = new Uint8Array(n * n * 3); // valores inteiros armazenados
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const i = (y * n + x) * 4;
          const k = (y * n + x) * 3;
          let r = d[i];
          let g = d[i + 1];
          let b = d[i + 2];
          if (modo === "cinza") {
            r = g = b = 0.299 * r + 0.587 * g + 0.114 * b;
          }
          const qr = Math.round((r / 255) * niveis);
          const qg = Math.round((g / 255) * niveis);
          const qb = Math.round((b / 255) * niveis);
          q[k] = qr;
          q[k + 1] = qg;
          q[k + 2] = qb;
          const canal = modo === "bayer" ? canalBayer(x, y) : modo;
          if (canal === "r" || canal === "g" || canal === "b") {
            const t = TINTA[canal];
            const val = (canal === "r" ? qr : canal === "g" ? qg : qb) * (255 / niveis);
            d[i] = val * t[0];
            d[i + 1] = val * t[1];
            d[i + 2] = val * t[2];
          } else {
            d[i] = qr * (255 / niveis);
            d[i + 1] = qg * (255 / niveis);
            d[i + 2] = qb * (255 / niveis);
          }
        }
      }
      smctx.putImageData(img, 0, 0);

      nctx.imageSmoothingEnabled = false;
      nctx.drawImage(small, 0, 0, VIEW, VIEW);
      const cell = VIEW / n;
      if (n <= 32) {
        nctx.strokeStyle = "rgba(0,0,0,0.28)";
        nctx.lineWidth = 1;
        nctx.beginPath();
        for (let k = 1; k < n; k++) {
          nctx.moveTo(k * cell, 0);
          nctx.lineTo(k * cell, VIEW);
          nctx.moveTo(0, k * cell);
          nctx.lineTo(VIEW, k * cell);
        }
        nctx.stroke();
      }
      // Janela selecionada
      nctx.lineWidth = 6;
      nctx.strokeStyle = "#000";
      nctx.strokeRect(x0 * cell, y0 * cell, w * cell, w * cell);
      nctx.lineWidth = 3;
      nctx.strokeStyle = "#fff";
      nctx.strokeRect(x0 * cell, y0 * cell, w * cell, w * cell);

      // 3. Matriz de números
      const mc = VIEW / w;
      mctx.textAlign = "center";
      mctx.textBaseline = "middle";
      for (let j = 0; j < w; j++) {
        for (let i2 = 0; i2 < w; i2++) {
          const x = x0 + i2;
          const y = y0 + j;
          const p = (y * n + x) * 4;
          const k = (y * n + x) * 3;
          const cr = d[p];
          const cg = d[p + 1];
          const cb = d[p + 2];
          mctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          mctx.fillRect(i2 * mc, j * mc, mc, mc);
          const lum = 0.299 * cr + 0.587 * cg + 0.114 * cb;
          mctx.fillStyle = lum > 140 ? "#111" : "#fff";
          const cx = i2 * mc + mc / 2;
          const cy = j * mc + mc / 2;
          if (modo === "rgb") {
            mctx.font = "500 19px ui-monospace, monospace";
            mctx.fillText(String(q[k]), cx, cy - 22);
            mctx.fillText(String(q[k + 1]), cx, cy);
            mctx.fillText(String(q[k + 2]), cx, cy + 22);
          } else {
            const canal = modo === "bayer" ? canalBayer(x, y) : modo;
            const val = canal === "g" ? q[k + 1] : canal === "b" ? q[k + 2] : q[k];
            mctx.font = "600 28px ui-monospace, monospace";
            mctx.fillText(String(val), cx, modo === "bayer" ? cy - 8 : cy);
            if (modo === "bayer") {
              mctx.font = "500 16px ui-monospace, monospace";
              mctx.fillText(canal.toUpperCase(), cx, cy + 20);
            }
          }
        }
      }
      mctx.strokeStyle = palette.bg;
      mctx.lineWidth = 2;
      mctx.beginPath();
      for (let k = 1; k < w; k++) {
        mctx.moveTo(k * mc, 0);
        mctx.lineTo(k * mc, VIEW);
        mctx.moveTo(0, k * mc);
        mctx.lineTo(VIEW, k * mc);
      }
      mctx.stroke();
    };

    const animar =
      !pausado && visible && (fonte === "webcam" || (fonte === "cena" && !prefersReducedMotion()));
    if (!animar) {
      // Se pausado na webcam, mantém o frame já capturado no canvas da cena
      const manterFrame = pausado && fonte === "webcam";
      frame(lastMsRef.current, !manterFrame);
      return;
    }
    let raf = 0;
    const loop = (ms: number) => {
      frame(ms, true);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [palette, visible, fonte, imagem, pausado, n, bits, modo, sel]);

  return (
    <div ref={rootRef}>
      <Controles>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Cena</span>
          <div className="flex flex-wrap gap-1.5">
            <LabButton onClick={usarCena} primary={fonte === "cena"}>
              Cena de teste
            </LabButton>
            <LabButton onClick={usarWebcam} primary={fonte === "webcam"}>
              Usar minha câmera
            </LabButton>
            <label
              className={`px-4 py-2 text-xs font-medium border cursor-pointer transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
                fonte === "upload"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-foreground hover:bg-foreground hover:text-background"
              }`}
            >
              Enviar imagem
              <input type="file" accept="image/*" onChange={usarArquivo} className="sr-only" />
            </label>
            {fonte !== "upload" && (
              <LabButton onClick={() => setPausado((p) => !p)}>
                {pausado ? "Retomar" : "Congelar frame"}
              </LabButton>
            )}
          </div>
        </div>
        <Slider
          label="Resolução do sensor"
          value={resIdx}
          min={0}
          max={RESOLUCOES.length - 1}
          step={1}
          onChange={setResIdx}
          display={`${n} × ${n}`}
        />
        <Slider
          label="Bits por canal"
          value={bits}
          min={1}
          max={8}
          step={1}
          onChange={setBits}
          display={`${bits} bits · ${2 ** bits} níveis`}
        />
        <Segmented<Modo>
          label="O que o sensor guarda"
          value={modo}
          onChange={setModo}
          options={[
            { value: "rgb", label: "RGB" },
            { value: "cinza", label: "Cinza" },
            { value: "r", label: "Só R" },
            { value: "g", label: "Só G" },
            { value: "b", label: "Só B" },
            { value: "bayer", label: "Bayer (cru)" },
          ]}
        />
      </Controles>

      {erro && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Painel rotulo="1." titulo="Cena: luz contínua">
          <canvas ref={sceneRef} width={SCENE} height={SCENE} className={canvasClass} />
        </Painel>
        <Painel rotulo="2." titulo={`Sensor: ${n} × ${n} fotossítios`}>
          <canvas
            ref={sensorRef}
            width={VIEW}
            height={VIEW}
            className={`${canvasClass} cursor-crosshair`}
            onPointerMove={(e) => setSel(relPos(e, e.currentTarget))}
            onPointerDown={(e) => setSel(relPos(e, e.currentTarget))}
            aria-label="Imagem amostrada pelo sensor. Passe o ponteiro para escolher a região mostrada como matriz."
          />
        </Painel>
        <Painel rotulo="3." titulo="Memória: o que o programa recebe">
          <canvas
            ref={matrixRef}
            width={VIEW}
            height={VIEW}
            className={canvasClass}
            aria-label="Valores inteiros dos pixels da região selecionada."
          />
        </Painel>
      </div>

      {/* Vídeo fora da tela: só alimenta o canvas da cena */}
      <video
        ref={videoRef}
        playsInline
        muted
        aria-hidden="true"
        className="absolute w-px h-px opacity-0 pointer-events-none"
      />

      <div className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2 text-sm leading-relaxed">
        <p className="tabular-nums">
          <span className="font-semibold">
            {n} × {n} × {canais} = {totalNumeros.toLocaleString("pt-BR")} números
          </span>{" "}
          de {bits} bits cada: {tamanho(totalNumeros * bits)} para a imagem inteira. Passe o
          ponteiro sobre o sensor para mudar a região de {Math.min(JANELA, n)} × {Math.min(JANELA, n)}{" "}
          pixels aberta no painel 3.
        </p>
        <div className="min-w-0 text-muted-foreground">
          <Formula block tex={String.raw`I \in \{0, \dots, 2^{b}-1\}^{H \times W \times C}, \qquad q = \left\lfloor \frac{v}{v_{\max}}\,(2^{b}-1) + \tfrac{1}{2} \right\rfloor`} />
          {modo === "bayer" && (
            <p className="mt-2">
              No modo Bayer cada fotossítio mede uma única cor (padrão RGGB). As duas que faltam são
              estimadas a partir dos vizinhos, na etapa chamada demosaico.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
