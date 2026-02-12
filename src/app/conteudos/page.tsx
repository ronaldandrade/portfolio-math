export default function ConteudosPage() {
  // Simulação de dados (depois virá do YouTube API ou banco de dados)
  const videos = [
    { id: 1, title: "Introdução ao Manim", date: "Fev 2026", url: "https://youtube.com/embed/Jb1W0EzuEME?si=WyOPuEz91Lxcxldc" },
    { id: 2, title: "Matemática do Machine Learning", date: "Jan 2026", url: "https://www.youtube.com/embed/SEU_ID_VIDEO_AQUI" },
    { id: 3, title: "Criando Redes Neurais do Zero", date: "Dez 2025", url: "https://www.youtube.com/embed/SEU_ID_VIDEO_AQUI" },
    { id: 4, title: "Visualizando Dados com Python", date: "Nov 2025", url: "https://www.youtube.com/embed/SEU_ID_VIDEO_AQUI" },
    { id: 5, title: "Criando Redes Neurais do Zero", date: "Dez 2025", url: "https://www.youtube.com/embed/SEU_ID_VIDEO_AQUI" },
  ];

  return (
    <section className="max-w-5xl w-full px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Conteúdos Recentes</h1>
      <p className="text-slate-400 mb-10">Tutoriais, visualizações matemáticas e devlogs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-slate-00 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
            {/* Área do Vídeo (Embed) */}
            <div className="aspect-video w-full bg-black">
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
              <span className="text-xs text-blue-400 font-mono">{video.date}</span>
              <h3 className="font-semibold text-white mt-1 group-hover:text-blue-200">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}