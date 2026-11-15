import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./lab.css";
import { LabFooter, LabHeader } from "../components/lab/LabChrome";

// Tipos próprios do laboratório; a mono do blog (Plex Mono) segue nos rótulos técnicos
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-lab-display",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-lab-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rams.Lab | Laboratório de Visão Computacional",
  description:
    "Experimentos interativos de visão computacional: pixels, convolução, PCA, descida de gradiente, redes neurais e IoU, ligados aos artigos do Rams.Log.",
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`lab ${archivo.variable} ${plexSans.variable} w-full flex-grow flex flex-col`}>
      <LabHeader />
      <div className="flex-grow">{children}</div>
      <LabFooter />
    </div>
  );
}
