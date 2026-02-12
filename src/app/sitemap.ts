import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://SEU_DOMINIO_AQUI.com' // <-- Coloque seu domínio final aqui quando tiver
  
  // 1. Páginas estáticas
  const routes = [
    '',
    '/sobre',
    '/blog',
    '/conteudos',
    '/materiais',
    '/links',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. Posts do Blog (Dinâmicos)
  const posts = getSortedPostsData().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...posts]
}