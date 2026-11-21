import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define onde os ficheiros MDX estão guardados
const postsDirectory = path.join(process.cwd(), 'src/content/posts/');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
  author?: string;
  /** Caminho em /public para a capa (ex.: '/capa-carros.jpg') */
  cover?: string;
  /** Rótulo da categoria; se ausente, usa a primeira tag */
  category?: string;
  readingTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface PostHeading {
  level: 2 | 3;
  text: string;
  id: string;
}

export function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim();
}

export function extractHeadings(content: string): PostHeading[] {
  const headings: PostHeading[] = [];
  const slugCounts = new Map<string, number>();
  let inCodeBlock = false;

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = stripMarkdown(match[2].replace(/\s+#+\s*$/, ''));
    const base = slugifyHeading(text);
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;

    headings.push({ level, text, id });
  }

  return headings;
}

export function getSortedPostsData(): PostMeta[] {
  // Cria a pasta se não existir
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }

  // Lê os nomes dos ficheiros
  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData = fileNames.map((fileName) => {
    // Remove ".mdx" do nome para criar o slug
    const slug = fileName.replace(/\.mdx$/, '');

    // Lê o conteúdo do ficheiro
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Usa gray-matter para separar metadados do conteúdo
    const { data } = matter(fileContents);

    return {
      slug,
      ...(data as Omit<PostMeta, 'slug'>),
    };
  });

  // Ordena por data (mais recente primeiro)
  return allPostsData.sort((a, b) => {
    return a.date < b.date ? 1 : -1;
  });
}

export function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Retorna conteúdo cru e metadados
  const { content, data } = matter(fileContents);

  return {
    slug,
    content,
    meta: data as PostMeta,
  };
}
