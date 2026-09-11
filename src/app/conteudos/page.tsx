import { getChannelVideos, type Video } from "@/lib/api";
import VideoCard from "../components/VideoCard";

// Revalida a página de hora em hora: vídeos novos aparecem sozinhos
export const revalidate = 3600;

// Usado apenas se a API do YouTube falhar ou as chaves não estiverem configuradas
const fallbackVideos: Video[] = [
  {
    id: "Jb1W0EzuEME",
    title: "Aula de Porcentagem",
    description: "",
    url: "https://www.youtube.com/embed/Jb1W0EzuEME",
    watchUrl: "https://www.youtube.com/watch?v=Jb1W0EzuEME",
    thumb: "https://i.ytimg.com/vi/Jb1W0EzuEME/hqdefault.jpg",
    publishedAt: "2026-02-01",
  },
  {
    id: "zCsEQSQ1XEc",
    title: "Sistemas de Equações",
    description: "",
    url: "https://www.youtube.com/embed/zCsEQSQ1XEc",
    watchUrl: "https://www.youtube.com/watch?v=zCsEQSQ1XEc",
    thumb: "https://i.ytimg.com/vi/zCsEQSQ1XEc/hqdefault.jpg",
    publishedAt: "2026-01-01",
  },
];

export default async function ConteudosPage() {
  const fetched = await getChannelVideos(12);
  const videos = fetched.length > 0 ? fetched : fallbackVideos;

  return (
    <section className="max-w-5xl w-full px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Conteúdos Recentes</h1>
      <p className="text-muted-foreground mb-10">
        Tutoriais, visualizações matemáticas e devlogs — direto do canal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
