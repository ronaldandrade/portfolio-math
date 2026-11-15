"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowUpRight, Github, Linkedin, Moon, Sun, Youtube } from "lucide-react";

/** Seis amostras de uma carta de calibração de cores: a marca do laboratório. */
const CARTA = ["#735244", "#5b7a9c", "#576c43", "#c9652b", "#e0a32e", "#f3f3f2"];

/** Marca: carta de cores + nome. */
function Marca() {
  return (
    <Link href="/laboratorio" className="flex items-center gap-3 group">
      <span className="grid grid-cols-3 gap-[2px]" aria-hidden="true">
        {CARTA.map((c) => (
          <span key={c} className="block w-2.5 h-2.5" style={{ background: c }} />
        ))}
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-lab-display)", fontStretch: "112%" }}>
          Rams.Lab
        </span>
        <span className="lab-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
          Visão computacional
        </span>
      </span>
    </Link>
  );
}

const NAV = [
  { nome: "O caminho", href: "/laboratorio#caminho" },
  { nome: "Perguntas", href: "/laboratorio#perguntas" },
  { nome: "Artigos", href: "/laboratorio#artigos" },
];

/** Cabeçalho do laboratório, com volta para o blog. */
export function LabHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3">
        <Marca />
        <nav aria-label="Seções do laboratório" className="order-3 md:order-none w-full md:w-auto overflow-x-auto">
          <ul className="flex gap-6 text-sm font-medium whitespace-nowrap">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block py-1.5 hover:text-primary transition-colors">
                  {n.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="lab-mono inline-flex items-center gap-1 border border-border bg-card px-3 py-1.5 text-xs hover:border-foreground transition-colors"
          >
            Rams.Log
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema claro e escuro"
            className="relative w-9 h-9 flex items-center justify-center hover:text-primary transition-colors"
          >
            <Sun className="h-[1.1rem] w-[1.1rem] dark:hidden" />
            <Moon className="h-[1.1rem] w-[1.1rem] hidden dark:block" />
          </button>
        </div>
      </div>
    </header>
  );
}

/** Rodapé do laboratório. */
export function LabFooter() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 py-10 grid gap-8 md:grid-cols-[2fr_1fr_1fr] text-sm">
        <div className="flex flex-col gap-3">
          <Marca />
          <p className="text-muted-foreground max-w-md leading-relaxed">
            O que eu aprendo sobre visão computacional, em forma de experimento. A teoria e a
            matemática por extenso ficam no blog.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="lab-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">No blog</p>
          <Link href="/blog?tag=Visão%20Computacional" className="hover:text-primary">Artigos de visão computacional</Link>
          <Link href="/blog" className="hover:text-primary">Todos os artigos</Link>
          <Link href="/conteudos" className="hover:text-primary">Vídeos</Link>
          <Link href="/sobre" className="hover:text-primary">Sobre</Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="lab-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">Onde me achar</p>
          <a href="https://github.com/ronaldandrade" className="inline-flex items-center gap-2 hover:text-primary">
            <Github size={16} aria-hidden="true" /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/ronaldandrademendonca/" className="inline-flex items-center gap-2 hover:text-primary">
            <Linkedin size={16} aria-hidden="true" /> LinkedIn
          </a>
          <a href="https://youtube.com/@ronaldandrade5395" className="inline-flex items-center gap-2 hover:text-primary">
            <Youtube size={16} aria-hidden="true" /> YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}
