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
