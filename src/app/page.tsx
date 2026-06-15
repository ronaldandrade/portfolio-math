import Link from "next/link";
import HomeCarousel from "./components/HomeCarrosel";
import { getSortedPostsData } from "@/lib/posts"; 
import { getLatestMaterial, getLatestVideo } from "@/lib/api"; // <--- Novas funções

export default async function Home() {
  // 1. Busca Post (Sistema de Arquivos MDX - Já é automático)
  const allPosts = getSortedPostsData();
  const latestPost = allPosts.length > 0 ? allPosts[0] : null;

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

    </div>
  );
}





