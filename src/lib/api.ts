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
export async function getLatestVideo() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!API_KEY || !CHANNEL_ID) return null;

  try {
    // Busca os vídeos mais recentes do canal
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=1&type=video`,
      { next: { revalidate: 3600 } } // Cache por 1 hora (importante para não estourar cota do Google)
    );

    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    const video = data.items[0];
    
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/embed/${video.id.videoId}`,
      thumb: video.snippet.thumbnails.high.url
    };
  } catch (error) {
    console.error("Erro ao buscar YouTube:", error);
    return null;
  }
}