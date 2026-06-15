import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogIndex() {
  const posts = getSortedPostsData();

  return (
    <div className="max-w-4xl w-full px-6 py-12 mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-foreground">Artigos & Ensaios</h1>
      <p className="text-muted-foreground mb-12 text-lg">
        Reflexões sobre código, matemática e a estrutura do universo digital.
      </p>

      <div className="grid gap-8">
        {posts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`}
            className="group block p-6 border border-border rounded-2xl hover:bg-muted/50 hover:border-primary/30 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
              <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <time className="text-sm font-mono text-muted-foreground">{post.date}</time>
            </div>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {post.description}
            </p>

            <div className="flex gap-2">
              {post.tags?.map(tag => (
                <span key={tag} className="text-xs font-medium px-2 py-1 bg-secondary rounded text-primary">
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}