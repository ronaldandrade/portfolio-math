export default function ConteudosPage() {
  // Simulação de dados (depois virá do YouTube API ou banco de dados)
  const videos = [
    { id: 1, title: "Aula de Porcentagem", date: "Fev 2026", url: "https://youtube.com/embed/Jb1W0EzuEME?si=WyOPuEz91Lxcxldc" },
    { id: 2, title: "Sistemas de Equações", date: "Jan 2026", url: "https://www.youtube.com/embed/zCsEQSQ1XEc?si=GVf9JOZPfDEpV5cP" },
  ];

  return (
    <section className="max-w-5xl w-full px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Conteúdos Recentes</h1>
      <p className="text-muted-foreground mb-10">Tutoriais, visualizações matemáticas e devlogs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all group">
            {/* Área do Vídeo (Embed) */}
            <div className="aspect-video w-full bg-muted">
              <iframe 
                width="100%" 
                height="100%" 
                src={video.url} 
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              ></iframe>
            </div>
            
            {/* Texto */}
            <div className="p-4">
              <span className="text-xs text-primary font-mono">{video.date}</span>
              <h3 className="font-semibold text-foreground mt-1 group-hover:text-primary">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}