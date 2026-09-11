import { createClient } from "@/lib/supabase/client"; // ou server se preferir, mas client aqui serve para leitura pública

// --- BUSCADOR DO SUPABASE (MATERIAIS) ---
export async function getLatestMaterial() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false }) // Pega o mais novo
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    title: data.title,
    description: data.description || "Novo material disponível para estudo.",
    fileUrl: data.file_url,
    type: data.type
  };
}

// --- BUSCADOR DO YOUTUBE ---

export interface Video {
  id: string;
  title: string;
  description: string;
  /** URL de embed, pronta para o iframe */
  url: string;
  /** Link normal do YouTube (para abrir fora do site) */
  watchUrl: string;
  thumb: string;
  publishedAt: string;
}

type PlaylistItem = {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url: string } | undefined>;
  };
};

/**
 * Busca os vídeos mais recentes do canal.
 *
 * Usa a playlist de uploads (`UU...`, que é o ID do canal `UC...` com o prefixo
 * trocado) em vez do endpoint `search`: o resultado é o mesmo, mas custa
 * 1 unidade de cota por chamada em vez de 100.
 */
export async function getChannelVideos(limit = 12): Promise<Video[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!API_KEY || !CHANNEL_ID || !CHANNEL_ID.startsWith("UC")) return [];

  // A playlist com todos os uploads do canal
  const uploadsPlaylistId = `UU${CHANNEL_ID.slice(2)}`;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${limit}`,
      { next: { revalidate: 3600 } } // Cache por 1 hora (importante para não estourar cota do Google)
    );

    if (!res.ok) {
      console.error("Erro ao buscar YouTube:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const items: PlaylistItem[] = data.items ?? [];

    return items.flatMap((item) => {
      const videoId = item.snippet.resourceId?.videoId;
      if (!videoId) return [];

      const thumbs = item.snippet.thumbnails ?? {};
      const thumb =
        thumbs.maxres?.url ??
        thumbs.standard?.url ??
        thumbs.high?.url ??
        thumbs.medium?.url ??
        thumbs.default?.url ??
        "";

      return [
        {
          id: videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://www.youtube.com/embed/${videoId}`,
          watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumb,
          publishedAt: item.snippet.publishedAt,
        },
      ];
    });
  } catch (error) {
    console.error("Erro ao buscar YouTube:", error);
    return [];
  }
}

/** O vídeo mais recente do canal (usado no carrossel da home). */
export async function getLatestVideo(): Promise<Video | null> {
  const videos = await getChannelVideos(1);
  return videos[0] ?? null;
}
