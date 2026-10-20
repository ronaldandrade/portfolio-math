import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { getSortedPostsData, type PostMeta } from "@/lib/posts";
import { getChannelVideos } from "@/lib/api";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const categoria = (post: PostMeta) => post.category ?? post.tags?.[0] ?? "Artigo";

// Rótulo pequeno com traço, usado nos títulos da sidebar e no hero
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-foreground">
      <span className="h-[3px] w-5 bg-primary" aria-hidden="true" />
      {children}
    </h2>
  );
}

function formatVideoDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

export default async function Home() {
  const posts = getSortedPostsData();
  const [destaque, ...demais] = posts;
  const videos = await getChannelVideos(3);

  // Tópicos: contagem de posts por tag, da mais usada para a menos
  const contagemTags = new Map<string, number>();
  posts.forEach((p) =>
    p.tags?.forEach((t) => contagemTags.set(t, (contagemTags.get(t) ?? 0) + 1))
  );
  const topicos = [...contagemTags.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);

  // Arquivo: contagem de posts por mês (YYYY-MM), mais recente primeiro
  const contagemMeses = new Map<string, number>();
  posts.forEach((p) => {
    const chave = p.date.slice(0, 7);
    contagemMeses.set(chave, (contagemMeses.get(chave) ?? 0) + 1);
  });
  const arquivo = [...contagemMeses.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ===== Coluna principal ===== */}
      <div className="lg:pr-10 lg:border-r border-border pb-16">
        {/* Hero */}
        <section className="pt-10 pb-10">
          <p className="flex items-center gap-4 font-mono text-xs md:text-sm font-medium uppercase tracking-[0.3em] mb-5">
            <span className="h-[3px] w-8 bg-primary" aria-hidden="true" />
            Caderno de estudos.
          </p>
          <h1 className="text-4xl md:text-6xl xl:text-[4rem] font-extrabold leading-[1.05] mb-6">
            Notas sobre matemática, dados e IA.
          </h1>
          <p className="max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
            Artigos, projetos e anotações sobre machine learning, visão
            computacional, séries temporais e muito mais. Conteúdo técnico,
            direto e com foco na prática.
          </p>
        </section>

        {/* Destaque */}
        {destaque && (
          <Link
            href={`/blog/${destaque.slug}`}
            className="group grid md:grid-cols-2 gap-8 items-start pb-10"
          >
            <div className="relative aspect-[1.9/1] md:aspect-auto md:h-full md:min-h-[290px] bg-card overflow-hidden">
              {destaque.cover ? (
                <Image
                  src={destaque.cover}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:28px_28px]"
                  aria-hidden="true"
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider mb-4">
                <time dateTime={destaque.date} className="text-muted-foreground">
                  {destaque.date}
                </time>
                <span className="text-muted-foreground">|</span>
                <span className="font-bold text-primary">{categoria(destaque)}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4 group-hover:text-primary transition-colors">
                {destaque.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-5">
                {destaque.description}
              </p>
              <span className="inline-flex items-center gap-3 text-sm font-medium">
                <span className="border-b border-foreground pb-0.5">Ler artigo</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        )}

        {/* Lista de artigos */}
        <ul className="border-t border-border">
          {demais.map((post) => (
            <li key={post.slug} className="border-b border-border">
              <Link
                href={`/blog/${post.slug}`}
                className="group grid md:grid-cols-[1fr_1fr_auto] gap-x-10 gap-y-3 items-center py-6 md:px-2"
              >
                <div>
                  <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider mb-2">
                    <time dateTime={post.date} className="text-muted-foreground">
                      {post.date}
                    </time>
                    <span className="text-muted-foreground">|</span>
                    <span className="font-bold text-primary">{categoria(post)}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {post.description}
                </p>
                <ArrowRight
                  size={18}
                  className="hidden md:block text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-3 text-sm font-medium"
          >
            <span className="border-b border-foreground pb-0.5">
              Ver todos os artigos ({posts.length})
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* ===== Sidebar ===== */}
      <aside className="lg:pl-8 pt-2 lg:pt-8 pb-16 space-y-12">
        {/* Sobre */}
        <section className="bg-card p-6">
          <Eyebrow>Sobre o Rams.Log</Eyebrow>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Este é o meu caderno de estudos sobre matemática, dados e
            inteligência artificial. Aqui compartilho artigos, projetos e
            anotações práticas do que venho aprendendo.
          </p>
          <Link
            href="/sobre"
            className="mt-5 inline-flex items-center gap-3 text-sm font-medium"
          >
            <span className="border-b border-foreground pb-0.5">Saiba mais</span>
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* Tópicos */}
        {topicos.length > 0 && (
          <section>
            <Eyebrow>Tópicos</Eyebrow>
            <ul className="mt-5 flex flex-wrap gap-2">
              {topicos.map(([tag, n]) => (
                <li key={tag}>
                  <Link
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="block bg-card px-3 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tag} ({n})
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Vídeos recentes */}
        {videos.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.25em]">
                <span className="grid h-5 w-6 place-items-center bg-primary text-primary-foreground" aria-hidden="true">
                  <Play size={10} fill="currentColor" />
                </span>
                Vídeos recentes
              </h2>
              <Link
                href="/conteudos"
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="border-b border-current">Ver todos</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <ul className="mt-5 space-y-4">
              {videos.map((video) => (
                <li key={video.id}>
                  <Link
                    href={video.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-[148px_1fr] gap-4 items-start"
                  >
                    <div className="relative aspect-video bg-card overflow-hidden">
                      {video.thumb && (
                        <Image
                          src={video.thumb}
                          alt=""
                          fill
                          sizes="148px"
                          className="object-cover"
                        />
                      )}
                      <span className="absolute bottom-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-sm bg-black/70 text-white" aria-hidden="true">
                        <Play size={9} fill="currentColor" />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-sans text-[13px] font-semibold leading-snug tracking-normal group-hover:text-primary transition-colors line-clamp-3">
                        {video.title}
                      </h3>
                      <time className="mt-2 block font-mono text-[11px] text-muted-foreground">
                        {formatVideoDate(video.publishedAt)}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Arquivo */}
        {arquivo.length > 0 && (
          <section>
            <Eyebrow>Arquivo</Eyebrow>
            <ul className="mt-4">
              {arquivo.map(([chave, n]) => {
                const [ano, mes] = chave.split("-");
                return (
                  <li key={chave}>
                    <Link
                      href={`/blog?mes=${chave}`}
                      className="flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span>
                        {MESES[Number(mes) - 1]} {ano} ({n})
                      </span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
