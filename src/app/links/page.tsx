import { Github, Linkedin, Youtube, BookOpen, ArrowUpRight } from "lucide-react";
import PageHeader from "../components/PageHeader";

const links = [
  { name: "Canal no YouTube", url: "https://youtube.com/@ronaldandrade5395?si=6s2UynVKMm69tl1v", icon: Youtube },
  { name: "Meu GitHub", url: "https://github.com/ronaldandrade", icon: Github },
  { name: "LinkedIn Profissional", url: "https://www.linkedin.com/in/ronaldandrademendonca/", icon: Linkedin },
  { name: "Materiais de Estudo", url: "/materiais", icon: BookOpen },
  { name: "Ler meus Artigos", url: "/blog", icon: BookOpen },
];

export default function LinksPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 pb-20">
      <PageHeader
        eyebrow="Links."
        title="Onde me encontrar."
        description="Ronald Andrade, cientista de dados e matemático."
      />

      <ul className="max-w-2xl border-t border-border">
        {links.map((link) => (
          <li key={link.name} className="border-b border-border">
            <a
              href={link.url}
              className="group flex items-center gap-4 py-5 px-2 text-lg font-extrabold font-display hover:text-primary transition-colors"
            >
              <link.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              {link.name}
              <ArrowUpRight size={18} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
