import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

const difficultyLabel: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-3 mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <time dateTime={post.date} className="tabular-nums">
          {formatDate(post.date)}
        </time>
        {post.readingTime && <span className="shrink-0">{post.readingTime}</span>}
      </div>

      <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors mb-2">
        {post.title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5">
        {post.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2">
        {post.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs text-primary/80">
            #{tag}
          </span>
        ))}
        {post.difficulty && (
          <span className="ml-auto rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {difficultyLabel[post.difficulty] ?? post.difficulty}
          </span>
        )}
        <ArrowUpRight
          size={16}
          className="text-muted-foreground group-hover:text-primary transition-colors"
        />
      </div>
    </Link>
  );
}
