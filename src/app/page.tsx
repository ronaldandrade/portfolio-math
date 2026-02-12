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

        <span className="text-blue-400 font-mono text-sm mb-4 tracking-wider uppercase">
          Matemática • Dados • Inteligência Artificial
        </span>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white">
          Desvendando a <br className="hidden md:block" /> complexidade do
          Mundo.
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-2xl leading-relaxed mx-auto">
          Bem-vindo ao meu portfólio. Aqui compartilho minha jornada transitando
          entre a lógica matemática e a criatividade dos algoritmos de Machine
          Learning.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/conteudos" 
            className="border border-border text-foreground px-6 py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
          >
            Meus Vídeos
          </Link>
                    <Link 
            href="/blog" 
            className="border border-border text-foreground px-6 py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
          >
            Artigos
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





