import { getPostData, getSortedPostsData } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Componentes disponíveis dentro do MDX
import GraficoAtivacao from "@/app/components/graficos/grafico_Interativo_sigmoid";
import SimuladorLimites from "@/app/components/graficos/grafico_simulador_limites";

const mdxComponents = {
  GraficoAtivacao,
  SimuladorLimites,
};

// Plugins
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

// Estilos
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css";

// Promise para garantir que params seja resolvido antes de usar
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// generateMetadata também precisa aguardar params ---
export async function generateMetadata({ params }: Props) {
  const { slug } = await params; // Await aqui
  const post = getPostData(slug);
  
  if (!post) {
    return { title: "Post não encontrado" };
  }

  return {
    title: `${post.meta.title} | Ronald Math`,
    description: post.meta.description,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params; 
  
  // Tratamento de erro caso o slug não exista
  if (!slug) {
    return <div>Erro: Artigo não encontrado.</div>;
  }

  const { content, meta } = getPostData(slug);

  return (
    <article className="max-w-3xl w-full px-6 py-12 mx-auto">
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Voltar para o blog
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          {meta.title}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground font-mono text-sm">
          <time>{meta.date}</time>
          <span>•</span>
          <div className="flex gap-2">
            {meta.tags?.map(tag => (
              <span key={tag} className="text-primary">#{tag}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:font-normal">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex, rehypeHighlight],
            },
          }}
        />
      </div>

      <div className="mt-16 pt-8 border-t border-border">
         <p className="text-muted-foreground italic">
           Gostou deste artigo? <Link href="/links" className="text-primary underline">Inscreva-se na newsletter</Link>.
         </p>
      </div>
    </article>
  );
}