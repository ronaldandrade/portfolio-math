import type { ComponentType, ReactNode } from "react";
import CameraLab from "./CameraLab";
import ConvolutionLab from "./ConvolutionLab";
import GradientLab from "./GradientLab";
import IouLab from "./IouLab";
import NeuralLab from "./NeuralLab";
import PcaLab from "./PcaLab";

export type EtapaId = "captura" | "filtros" | "representacao" | "aprendizado" | "deteccao";

/** Etapa do caminho que uma imagem percorre até virar uma decisão. */
export interface Etapa {
  id: EtapaId;
  nome: string;
  resumo: string;
  /** Slugs de artigos do blog que cobrem a teoria desta etapa. */
  posts: string[];
}

/** Experimento interativo do laboratório. */
export interface Experimento {
  slug: string;
  etapa: EtapaId;
  titulo: string;
  /** Pergunta que o experimento responde. */
  pergunta: string;
  resumo: string;
  intro: ReactNode;
  Componente: ComponentType;
}

/** Para incluir uma etapa nova, acrescente aqui; a ordem é a do caminho. */
export const ETAPAS: Etapa[] = [
  {
    id: "captura",
    nome: "Captura",
    resumo: "A luz vira uma grade de inteiros.",
    posts: [],
  },
  {
    id: "filtros",
    nome: "Filtros",
    resumo: "Janelas pequenas realçam bordas e texturas.",
    posts: ["calculo_deep_learning"],
  },
  {
    id: "representacao",
    nome: "Representação",
    resumo: "Muitos números viram poucos, sem perder o essencial.",
    posts: ["pca_reducao_dimensionalidade", "algebralinear"],
  },
  {
    id: "aprendizado",
    nome: "Aprendizado",
    resumo: "Os pesos são ajustados descendo o gradiente da perda.",
    posts: ["redes_neurais_profundas", "calculo_deep_learning"],
  },
  {
    id: "deteccao",
    nome: "Detecção",
    resumo: "A rede diz o que há na imagem e onde.",
    posts: [
      "reconhecimento_objetos_yolo",
      "benchmark_detectores_objetos",
      "contagem_carros_visao_computacional",
    ],
  },
];

/** Para publicar um experimento novo, acrescente aqui; a ordem é a de leitura. */
export const EXPERIMENTOS: Experimento[] = [
  {
    slug: "pixels",
    etapa: "captura",
    titulo: "Da luz ao número",
    pergunta: "O que o computador recebe de uma câmera?",
    resumo: "Amostragem, quantização e o mosaico de Bayer, com a sua própria câmera se quiser.",
    Componente: CameraLab,
    intro: (
      <>
        <p>
          Uma câmera não guarda a cena. Ela divide a luz numa grade de fotossítios, mede a
          intensidade em cada um e arredonda a medida para um inteiro. O que chega ao seu programa
          é só essa tabela de inteiros.
        </p>
        <p>
          Reduza a resolução até o piso xadrez virar um borrão e os bits até o céu virar faixas.
          Dá para apontar a sua câmera também; a imagem não sai do navegador.
        </p>
      </>
    ),
  },
  {
    slug: "convolucao",
    etapa: "filtros",
    titulo: "Convolução",
    pergunta: "Como ele encontra bordas?",
    resumo: "Um kernel 3 × 3 editável desliza sobre a imagem e mostra a conta de cada pixel.",
    Componente: ConvolutionLab,
    intro: (
      <>
        <p>
          O primeiro passo de uma rede convolucional é este: uma janela pequena percorre a imagem
          e, em cada posição, multiplica os pixels pelos pesos do kernel e soma. Pesos diferentes
          detectam coisas diferentes.
        </p>
        <p>
          Compare Sobel X e Sobel Y nas bordas da casa, depois edite os pesos à mão. Numa CNN esses
          nove números são aprendidos, não escolhidos.
        </p>
      </>
    ),
  },
  {
    slug: "pca",
    etapa: "representacao",
    titulo: "Componentes principais",
    pergunta: "Como resumir muitos números em poucos?",
    resumo: "Arraste os pontos e veja os autovetores da covariância girarem.",
    Componente: PcaLab,
    intro: (
      <>
        <p>
          O PCA encontra a direção em que os dados mais variam (PC1) e a direção perpendicular a
          ela (PC2). São os autovetores da matriz de covariância, e os autovalores dizem quanta
          variância cada um carrega.
        </p>
        <p>
          Projetar os pontos no PC1 é reduzir de duas dimensões para uma perdendo o mínimo
          possível. Com imagens a ideia é a mesma, só que em milhares de dimensões.
        </p>
      </>
    ),
  },
  {
    slug: "gradiente",
    etapa: "aprendizado",
    titulo: "Descida de gradiente",
    pergunta: "Como os pesos são ajustados?",
    resumo: "GD, momento e Adam numa superfície 2D; clique para escolher a partida.",
    Componente: GradientLab,
    intro: (
      <>
        <p>
          Treinar um modelo é procurar o ponto mais baixo de uma função. O gradiente aponta para
          onde ela mais cresce; andando no sentido contrário, com passo η, a perda cai.
        </p>
        <p>
          O tamanho do passo decide tudo: pequeno demais e a descida não chega, grande demais e ela
          salta para fora do vale.
        </p>
      </>
    ),
  },
  {
    slug: "rede-neural",
    etapa: "aprendizado",
    titulo: "Rede neural ao vivo",
    pergunta: "Como uma rede aprende uma fronteira?",
    resumo: "Uma MLP treina no navegador enquanto a fronteira de decisão se forma.",
    Componente: NeuralLab,
    intro: (
      <>
        <p>
          Uma rede pequena aprende a separar duas classes de pontos no plano. O treino roda aqui
          mesmo, em lote completo com Adam, e o fundo do gráfico mostra o que a rede prevê para
          cada posição.
        </p>
        <p>
          Mude a arquitetura e observe quando a rede tem capacidade para dobrar a fronteira e
          quando não tem.
        </p>
      </>
    ),
  },
  {
    slug: "iou",
    etapa: "deteccao",
    titulo: "Interseção sobre união",
    pergunta: "Quando uma detecção conta como acerto?",
    resumo: "Mova a caixa prevista sobre a anotada e acompanhe a IoU e o veredito.",
    Componente: IouLab,
    intro: (
      <>
        <p>
          Um detector devolve caixas. Para saber se uma caixa está certa, compara-se com a caixa
          anotada por uma pessoa: a área em comum dividida pela área total coberta pelas duas.
        </p>
        <p>
          Essa única razão está por trás do mAP, da supressão de não máximos e do casamento de
          caixas durante o treino.
        </p>
      </>
    ),
  },
];

/** Experimentos de uma etapa, na ordem de leitura. */
export function experimentosDa(etapa: EtapaId): Experimento[] {
  return EXPERIMENTOS.filter((e) => e.etapa === etapa);
}

/** Pictograma de um experimento (64 × 64, traço na cor do texto). */
export function Glifo({ slug, className = "" }: { slug: string; className?: string }) {
  const comum = {
    viewBox: "0 0 64 64",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    "aria-hidden": true,
  } as const;
  switch (slug) {
    case "pixels":
      return (
        <svg {...comum}>
          <rect x="8" y="8" width="48" height="48" />
          <path d="M24 8v48M40 8v48M8 24h48M8 40h48" />
          <rect x="24" y="24" width="16" height="16" fill="currentColor" />
          <rect x="40" y="8" width="16" height="16" fill="currentColor" fillOpacity="0.35" stroke="none" />
        </svg>
      );
    case "convolucao":
      return (
        <svg {...comum}>
          <rect x="6" y="14" width="36" height="36" />
          <path d="M18 14v36M30 14v36M6 26h36M6 38h36" />
          <path d="M46 32h12M52 26l6 6-6 6" />
        </svg>
      );
    case "pca":
      return (
        <svg {...comum}>
          <path d="M8 54L56 10" />
          <path d="M24 22l14 16" strokeDasharray="3 4" />
          {[
            [14, 44],
            [22, 42],
            [26, 32],
            [36, 30],
            [40, 20],
            [48, 22],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" stroke="none" />
          ))}
        </svg>
      );
    case "gradiente":
      return (
        <svg {...comum}>
          <ellipse cx="32" cy="34" rx="26" ry="18" />
          <ellipse cx="32" cy="34" rx="16" ry="10" />
          <ellipse cx="32" cy="34" rx="6" ry="3.5" />
          <path d="M8 12l10 14 8 2 6 6" />
        </svg>
      );
    case "rede-neural":
      return (
        <svg {...comum}>
          <path d="M12 20l20-8M12 20l20 20M12 44l20-32M12 44l20-4M32 12l20 20M32 40l20-8M32 52l20-20M12 44l20 8M12 20l20 32" strokeWidth="1.2" />
          {[
            [12, 20],
            [12, 44],
            [32, 12],
            [32, 40],
            [32, 52],
            [52, 32],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="hsl(var(--card))" />
          ))}
        </svg>
      );
    default:
      return (
        <svg {...comum}>
          <rect x="8" y="18" width="34" height="34" />
          <rect x="24" y="10" width="32" height="30" strokeDasharray="5 4" />
          <rect x="24" y="18" width="18" height="22" fill="currentColor" fillOpacity="0.3" stroke="none" />
        </svg>
      );
  }
}
