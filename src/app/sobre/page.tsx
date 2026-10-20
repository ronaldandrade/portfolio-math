import PageHeader from "../components/PageHeader";

const stack = ["Python", "Deep Learning", "Computer Vision", "JavaScript", "LaTeX", "Manim"];

export default function SobrePage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 pb-20">
      <PageHeader eyebrow="Sobre." title="Quem escreve por aqui." />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 border-t border-border pt-10">
        <div className="max-w-2xl space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg">
          <p>
            Olá, sou o Ronald. Minha trajetória é marcada pela disciplina e pela lógica.
            Atualmente militar, estou em plena transição de carreira para o mundo da
            Tecnologia, com foco em <strong className="text-foreground">Data Science</strong> e{" "}
            <strong className="text-foreground">Inteligência Artificial</strong>.
          </p>
          <p>
            Sou pós-graduado na área e possuo uma forte aptidão para matemática e computação.
            Meu objetivo não é apenas escrever código, mas usar a tecnologia para resolver
            problemas complexos, especialmente no campo da Visão Computacional.
          </p>
          <p>
            Este site é o repositório central dos meus estudos, projetos, pesquisas e artigos
            sobre tecnologia e matemática.
          </p>
        </div>

        <aside className="lg:border-l border-border lg:pl-8">
          <h2 className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.25em] mb-5">
            <span className="h-[3px] w-5 bg-primary" aria-hidden="true" />
            Tech stack
          </h2>
          <ul className="flex flex-wrap gap-2">
            {stack.map((tech) => (
              <li key={tech} className="bg-card px-3 py-2 text-xs text-muted-foreground">
                {tech}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
