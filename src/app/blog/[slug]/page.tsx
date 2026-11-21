import {
  extractHeadings,
  getPostData,
  getSortedPostsData,
  slugifyHeading,
} from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import React from "react";

// Componentes disponíveis dentro do MDX
import GraficoAtivacao from "@/app/components/graficos/grafico_Interativo_sigmoid";
import SimuladorLimites from "@/app/components/graficos/grafico_simulador_limites";

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}

function createMdxComponents() {
  const slugCounts = new Map<string, number>();

  const nextId = (children: React.ReactNode) => {
    const base = slugifyHeading(extractTextFromChildren(children));
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };

  return {
    GraficoAtivacao,
    SimuladorLimites,
    h2: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 id={nextId(children)} className={`scroll-mt-24 ${className ?? ""}`} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 id={nextId(children)} className={`scroll-mt-24 ${className ?? ""}`} {...props}>
        {children}
      </h3>
    ),
    table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
      <div className="my-6 w-full overflow-x-auto">
        <table {...props}>{children}</table>
      </div>
    ),
  };
}

// Plugins
import remarkGfm from "remark-gfm";
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
    title: `${post.meta.title} | Rams.Log`,
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
  const headings = extractHeadings(content);
  const sectionCount = headings.filter((h) => h.level === 2).length;
  const mdxComponents = createMdxComponents();

  return (
    <article className="max-w-3xl w-full px-6 py-10 mx-auto">
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Voltar para o blog
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-5 leading-[1.1]">
          {meta.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
          <time>{meta.date}</time>
          <span>|</span>
          <div className="flex flex-wrap gap-3">
            {meta.tags?.map(tag => (
              <span key={tag} className="font-bold text-primary">{tag}</span>
            ))}
          </div>
        </div>
      </header>

      {headings.length > 0 && (
        <details className="group mb-10 border-y border-border py-3.5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <span className="font-bold text-primary">Sumário</span>
              <span>· {sectionCount} {sectionCount === 1 ? "seção" : "seções"}</span>
            </span>
            <ChevronDown
              size={15}
              className="transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <nav aria-label="Sumário do artigo" className="mt-4 border-l-2 border-primary/40 pl-4">
            <ul className="space-y-1.5">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  className={heading.level === 3 ? "pl-4" : ""}
                >
                  <a
                    href={`#${heading.id}`}
                    className={
                      heading.level === 2
                        ? "text-sm text-foreground/85 hover:text-primary transition-colors"
                        : "text-xs text-muted-foreground hover:text-primary transition-colors"
                    }
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      )}

      <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-extrabold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:font-normal">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [rehypeKatex, rehypeHighlight],
            },
          }}
        />
      </div>

      <div className="mt-16 pt-8 border-t border-border">
         <p className="text-muted-foreground italic">
           Gostou deste artigo? <Link href="/links" className="text-primary underline">Veja onde me encontrar</Link>.
         </p>
      </div>
    </article>
  );
}