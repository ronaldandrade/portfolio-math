import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getSortedPostsData } from "@/lib/posts";
import { ETAPAS, EXPERIMENTOS, experimentosDa } from "../../components/lab/registry";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return EXPERIMENTOS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exp = EXPERIMENTOS.find((e) => e.slug === slug);
  if (!exp) return {};
  return { title: `${exp.titulo} | Rams.Lab`, description: `${exp.pergunta} ${exp.resumo}` };
}

export default async function ExperimentoPage({ params }: Props) {
  const { slug } = await params;
  const indice = EXPERIMENTOS.findIndex((e) => e.slug === slug);
  if (indice < 0) notFound();

  const exp = EXPERIMENTOS[indice];
  const anterior = EXPERIMENTOS[indice - 1];
  const proximo = EXPERIMENTOS[indice + 1];
  const etapaIdx = ETAPAS.findIndex((e) => e.id === exp.etapa);
  const etapa = ETAPAS[etapaIdx];
  const posts = getSortedPostsData();
  const relacionados = etapa.posts
    .map((s) => posts.find((p) => p.slug === s))
    .filter((p) => p !== undefined);
  const Componente = exp.Componente;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10">
      {/* Trilho do caminho: mostra onde este experimento fica */}
      <nav aria-label="Caminho de uma imagem" className="border-b border-border overflow-x-auto">
        <ol className="flex min-w-max">
          {ETAPAS.map((e, i) => {
            const atual = e.id === exp.etapa;
            const primeiro = experimentosDa(e.id)[0];
            return (
              <li key={e.id} className="flex items-center">
                <Link
                  href={primeiro ? `/laboratorio/${primeiro.slug}` : "/laboratorio#caminho"}
                  aria-current={atual ? "step" : undefined}
                  className={`lab-mono flex items-center gap-2 py-3 pr-4 text-xs border-b-2 -mb-px transition-colors ${
                    atual
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{i + 1}</span>
                  {e.nome}
                </Link>
                {i < ETAPAS.length - 1 && (
                  <ArrowRight size={13} className="mr-4 text-muted-foreground" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <header className="grid gap-x-14 gap-y-5 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <p className="lab-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
            Etapa {etapaIdx + 1} · {etapa.nome}
          </p>
          <h1 className="text-4xl md:text-5xl leading-[1.05] mb-4">{exp.titulo}</h1>
          <p className="text-lg text-primary font-medium">{exp.pergunta}</p>
        </div>
        <div className="min-w-0 flex flex-col gap-3 leading-relaxed text-muted-foreground md:pt-9">
          {exp.intro}
        </div>
      </header>

      <Componente />

      {relacionados.length > 0 && (
        <section className="mt-14 border-t border-rule pt-8">
          <h2 className="text-2xl mb-5">A teoria, no blog</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {relacionados.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex h-full flex-col gap-2 border border-border bg-card p-5 hover:border-foreground transition-colors"
                >
                  <span className="lab-mono flex items-center justify-between text-xs text-muted-foreground">
                    Artigo{p.readingTime ? ` · ${p.readingTime}` : ""}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                    {p.title}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {p.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Outros experimentos" className="mt-14 grid gap-4 border-t border-rule pt-8 sm:grid-cols-2">
        {anterior ? (
          <Link href={`/laboratorio/${anterior.slug}`} className="group flex flex-col gap-1 border border-border p-5 hover:border-foreground transition-colors">
            <span className="lab-mono flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowLeft size={14} aria-hidden="true" /> Anterior
            </span>
            <span className="font-semibold text-lg group-hover:text-primary">{anterior.titulo}</span>
          </Link>
        ) : (
          <Link href="/laboratorio" className="group flex flex-col gap-1 border border-border p-5 hover:border-foreground transition-colors">
            <span className="lab-mono flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowLeft size={14} aria-hidden="true" /> Voltar
            </span>
            <span className="font-semibold text-lg group-hover:text-primary">Início do laboratório</span>
          </Link>
        )}
        {proximo ? (
          <Link href={`/laboratorio/${proximo.slug}`} className="group flex flex-col gap-1 border border-border p-5 sm:items-end sm:text-right hover:border-foreground transition-colors">
            <span className="lab-mono flex items-center gap-2 text-xs text-muted-foreground">
              Próximo <ArrowRight size={14} aria-hidden="true" />
            </span>
            <span className="font-semibold text-lg group-hover:text-primary">{proximo.titulo}</span>
          </Link>
        ) : (
          <Link href="/laboratorio#artigos" className="group flex flex-col gap-1 border border-border p-5 sm:items-end sm:text-right hover:border-foreground transition-colors">
            <span className="lab-mono flex items-center gap-2 text-xs text-muted-foreground">
              Continue <ArrowRight size={14} aria-hidden="true" />
            </span>
            <span className="font-semibold text-lg group-hover:text-primary">Artigos de visão computacional</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
