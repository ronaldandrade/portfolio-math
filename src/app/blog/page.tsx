import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogIndex() {
  const posts = getSortedPostsData();

  return (
    <div className="max-w-2xl w-full px-6 py-20 md:py-28 mx-auto">
      <header className="mb-16">
        <span className="block font-mono text-xs tracking-[0.2em] uppercase text-primary mb-5">
          Arquivo de estudos
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-5 text-foreground tracking-tight leading-[1.05]">
          Artigos
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-md">
          Registros do que aprendo sobre matemática, dados e inteligência
          artificial — em ordem cronológica.
        </p>
        <p className="mt-6 font-mono text-xs text-muted-foreground tabular-nums">
          {posts.length} {posts.length === 1 ? "registro" : "registros"}
        </p>
      </header>

      <ul className="divide-y divide-border border-t border-border">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block py-7 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight">
                  {post.title}
                </h2>
                <time className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {post.date}
                </time>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {post.description}
              </p>

              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {post.tags?.map((tag) => (
                  <span key={tag} className="text-xs text-primary/80">
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}