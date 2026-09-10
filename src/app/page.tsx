import Link from "next/link";
import { PlayCircle, BookOpen, User, LinkIcon } from "lucide-react";
import HomeCarousel from "./components/HomeCarrosel";
import PostCard from "./components/PostCard";
import { getSortedPostsData } from "@/lib/posts";
import { getLatestMaterial, getLatestVideo } from "@/lib/api";

const atalhos = [
  {
    href: "/conteudos",
    icon: PlayCircle,
    title: "Vídeos",
    description: "Aulas e visualizações matemáticas em vídeo.",
  },
  {
    href: "/materiais",
    icon: BookOpen,
    title: "Materiais",
    description: "PDFs, listas e recursos para baixar.",
  },
  {
    href: "/sobre",
    icon: User,
    title: "Sobre mim",
    description: "Quem escreve e por que este arquivo existe.",
  },
  {
    href: "/links",
    icon: LinkIcon,
    title: "Links",
    description: "Onde me encontrar fora daqui.",
  },
];

export default async function Home() {
  // 1. Busca Post (Sistema de Arquivos MDX - Já é automático)
  const allPosts = getSortedPostsData();
  const latestPost = allPosts.length > 0 ? allPosts[0] : null;
  const destaques = allPosts.slice(0, 4);

  // 2. Busca Vídeo (API do YouTube)
  const latestVideo = await getLatestVideo();

  // 3. Busca Material (Banco de Dados Supabase)
  const latestMaterial = await getLatestMaterial();

  return (
    <div className="flex flex-col items-center w-full px-4 mt-16 md:mt-24">
      {/* Hero Text */}
      <div className="text-center max-w-3xl mb-8">

        <span className="block text-primary font-mono text-sm mb-6 tracking-[0.2em] uppercase">
          Matemática • Dados • Inteligência Artificial
        </span>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.05]">
          Um arquivo vivo de estudos em <span className="text-primary">matemática</span> e <span className="text-primary">IA</span>.
        </h1>

        <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed mx-auto">
          Conteúdo informativo e didático, registrado conforme aprendo. Cada
          artigo, vídeo e material é um marco da jornada — da lógica matemática
          aos algoritmos de Machine Learning.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/blog"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
          >
            Explorar artigos
          </Link>
          <Link
            href="/conteudos"
            className="border border-border text-foreground px-6 py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
          >
            Ver vídeos
          </Link>
        </div>
      </div>

      {/* O Carrossel recebe dados VIVOS das APIs */}
      <HomeCarousel 
        latestPost={latestPost} 
        latestVideo={latestVideo} 
        latestMaterial={latestMaterial}
      />

      {/* ===== Trabalhos em destaque ===== */}
      {destaques.length > 0 && (
        <section className="w-full max-w-5xl mx-auto mb-24">
          <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="block font-mono text-xs tracking-[0.2em] uppercase text-primary mb-3">
                Trabalhos
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                O que tenho escrito
              </h2>
            </div>
            <Link
              href="/blog"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Ver todos ({allPosts.length}) →
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {destaques.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Atalhos para os outros formatos ===== */}
      <section className="w-full max-w-5xl mx-auto mb-28">
        <span className="block font-mono text-xs tracking-[0.2em] uppercase text-primary mb-3">
          Explore também
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8">
          Além dos artigos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {atalhos.map((atalho) => (
            <Link
              key={atalho.href}
              href={atalho.href}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:-translate-y-0.5"
            >
              <atalho.icon
                size={20}
                className="text-primary mb-4"
                aria-hidden="true"
              />
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                {atalho.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {atalho.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
