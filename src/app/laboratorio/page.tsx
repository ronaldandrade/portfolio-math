import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getSortedPostsData } from "@/lib/posts";
import HeroLens from "../components/lab/HeroLens";
import { ETAPAS, EXPERIMENTOS, Glifo, experimentosDa } from "../components/lab/registry";

const TAG = "Visão Computacional";

/** Perguntas respondidas por artigos do blog (as dos experimentos vêm do registro). */
const PERGUNTAS_ARTIGOS = [
  { pergunta: "Como um detector acha objetos numa imagem?", slug: "reconhecimento_objetos_yolo" },
  { pergunta: "Detectar é o mesmo que contar?", slug: "contagem_carros_visao_computacional" },
  { pergunta: "Qual detector cabe numa GPU de 4 GB?", slug: "benchmark_detectores_objetos" },
];

function formatarData(data: string): string {
  const d = new Date(`${data}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? data
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function LaboratorioPage() {
  const posts = getSortedPostsData();
  const titulo = new Map(posts.map((p) => [p.slug, p.title]));
  const artigos = posts.filter((p) => p.tags?.includes(TAG));

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10">
      {/* Abertura */}
      <section className="grid items-center gap-x-14 gap-y-10 py-12 md:py-16 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div>
          <p className="lab-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
            Laboratório do Rams.Log
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
            Como uma máquina aprende a ver.
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground max-w-[34rem] mb-8">
            Aqui fica o que eu aprendo sobre visão computacional, em forma de experimento. Cada um
            roda no seu navegador e mostra a conta por trás: mexa nos parâmetros e veja o que muda.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/laboratorio/${EXPERIMENTOS[0].slug}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Começar pelo primeiro experimento
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href="#caminho"
              className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-sm font-semibold hover:bg-foreground hover:text-background transition-colors"
            >
              Ver o caminho inteiro
            </a>
          </div>
        </div>
        <figure className="flex flex-col gap-5 px-2.5 md:px-0">
          <HeroLens />
          <figcaption className="lab-mono text-xs text-muted-foreground">
            Passe o ponteiro: dentro da lente, a imagem é o que ela sempre foi para o computador.
            Números de 0 a 255.
          </figcaption>
        </figure>
      </section>

      {/* O caminho de uma imagem */}
      <section id="caminho" className="scroll-mt-28 border-t border-rule pt-10 pb-6">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl md:text-4xl mb-3">O caminho de uma imagem</h2>
          <p className="text-muted-foreground leading-relaxed">
            Da lente à decisão, uma imagem passa por cinco etapas. O laboratório segue essa ordem:
            em cada etapa há experimentos para mexer e artigos do blog com a teoria.
          </p>
        </div>

        <ol>
          {ETAPAS.map((etapa, i) => {
            const exps = experimentosDa(etapa.id);
            return (
              <li
                key={etapa.id}
                className="grid gap-x-10 gap-y-5 border-t border-border py-8 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]"
              >
                <div>
                  <p className="lab-mono text-sm text-primary font-semibold mb-1">Etapa {i + 1} de {ETAPAS.length}</p>
                  <h3 className="text-2xl mb-2">{etapa.nome}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{etapa.resumo}</p>
                </div>

                <div className="min-w-0 flex flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {exps.map((e) => (
                      <Link
                        key={e.slug}
                        href={`/laboratorio/${e.slug}`}
                        className="group flex gap-4 border border-border bg-card p-4 transition-colors hover:border-foreground"
                      >
                        <Glifo slug={e.slug} className="w-14 h-14 shrink-0 text-primary" />
                        <span className="min-w-0 flex flex-col gap-1">
                          <span className="lab-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                            Experimento
                          </span>
                          <span className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                            {e.titulo}
                          </span>
                          <span className="text-sm text-muted-foreground leading-relaxed">{e.resumo}</span>
                        </span>
                      </Link>
                    ))}
                  </div>

                  {etapa.posts.length > 0 && (
                    <ul className="flex flex-col gap-2 text-sm">
                      {etapa.posts
                        .filter((slug) => titulo.has(slug))
                        .map((slug) => (
                          <li key={slug} className="flex gap-3">
                            <span className="lab-mono shrink-0 text-[11px] uppercase tracking-[0.15em] text-muted-foreground pt-0.5">
                              Artigo
                            </span>
                            <Link href={`/blog/${slug}`} className="underline underline-offset-4 decoration-border hover:decoration-primary hover:text-primary">
                              {titulo.get(slug)}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Comece pela pergunta */}
      <section id="perguntas" className="scroll-mt-28 border-t border-rule pt-10 pb-14">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl md:text-4xl mb-3">Ou comece pela pergunta</h2>
          <p className="text-muted-foreground leading-relaxed">
            Se você chegou com uma dúvida específica, vá direto ao ponto.
          </p>
        </div>
        <ul className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIMENTOS.map((e) => (
            <li key={e.slug} className="bg-background">
              <Link href={`/laboratorio/${e.slug}`} className="group flex h-full flex-col justify-between gap-6 p-5 hover:bg-card transition-colors">
                <span className="text-xl font-semibold leading-snug">{e.pergunta}</span>
                <span className="lab-mono flex items-center justify-between text-xs text-muted-foreground group-hover:text-primary">
                  Experimento · {e.titulo}
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
          {PERGUNTAS_ARTIGOS.filter((p) => titulo.has(p.slug)).map((p) => (
            <li key={p.slug} className="bg-background">
              <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col justify-between gap-6 p-5 hover:bg-card transition-colors">
                <span className="text-xl font-semibold leading-snug">{p.pergunta}</span>
                <span className="lab-mono flex items-center justify-between text-xs text-muted-foreground group-hover:text-primary">
                  Artigo no blog
                  <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Artigos de visão computacional, direto do blog */}
      <section id="artigos" className="scroll-mt-28 border-t border-rule pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl mb-3">A teoria está no blog</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tudo o que publiquei no Rams.Log com a tag {TAG}, do mais recente ao mais antigo.
            </p>
          </div>
          <Link
            href={`/blog?tag=${encodeURIComponent(TAG)}`}
            className="lab-mono inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:text-primary"
          >
            Abrir no blog
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <ul className="border-t border-border">
          {artigos.map((p) => (
            <li key={p.slug} className="border-b border-border">
              <Link
                href={`/blog/${p.slug}`}
                className="group grid gap-x-8 gap-y-1 py-4 md:grid-cols-[9rem_minmax(0,1fr)_auto] md:items-baseline"
              >
                <time dateTime={p.date} className="lab-mono text-xs text-muted-foreground">
                  {formatarData(p.date)}
                </time>
                <span className="font-semibold leading-snug group-hover:text-primary transition-colors">
                  {p.title}
                </span>
                {p.readingTime && (
                  <span className="lab-mono text-xs text-muted-foreground">{p.readingTime}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
