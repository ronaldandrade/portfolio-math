export default function SobrePage() {
  return (
    <section className="max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 border-l-4 border-blue-500 pl-4">
        Sobre Mim
      </h1>
      
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>
          Olá, sou o Ronald. Minha trajetória é marcada pela disciplina e pela lógica.
          Atualmente militar, estou em plena transição de carreira para o mundo da 
          Tecnologia, com foco em <strong>Data Science</strong> e <strong>Inteligência Artificial</strong>.
        </p>

        <p>
          Sou pós-graduado na área e possuo uma forte aptidão para matemática e computação.
          Meu objetivo não é apenas escrever código, mas usar a tecnologia para resolver 
          problemas complexos, especialmente no campo da Visão Computacional.
        </p>

        <p>
          Este site é o repositório central dos meus estudos, projetos (como meu scraper de notícias)
          e do meu futuro livro sobre Machine Learning para iniciantes.
        </p>
      </div>

      {/* Exemplo de "Stack" ou Tecnologias */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-4">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {["Python", "Deep Learning", "Computer Vision", "Next.js", "LaTeX", "Manim"].map((tech) => (
            <span key={tech} className="px-3 py-1 bg-slate-800 rounded-md text-sm text-blue-200">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}