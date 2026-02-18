import { getPostData, getSortedPostsData } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Voltar para o blog
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {meta.title}
        </h1>
        <div className="flex items-center gap-4 text-slate-500 font-mono text-sm">
          <time>{meta.date}</time>
          <span>•</span>
          <div className="flex gap-2">
            {meta.tags?.map(tag => (
              <span key={tag} className="text-blue-400">#{tag}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="prose prose-invert prose-lg prose-blue max-w-none">
        <MDXRemote 
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex, rehypeHighlight],
            },
          }}
        />
      </div>

      <div className="mt-16 pt-8 border-t border-slate-800">
         <p className="text-slate-400 italic">
           Gostou deste artigo? <Link href="/links" className="text-blue-400 underline">Inscreva-se na newsletter</Link>.
         </p>
      </div>
    </article>
  );
}