import { Github, Linkedin, Youtube, BookOpen } from "lucide-react"; // Instale lucide-react se não tiver

export default function LinksPage() {
  const links = [
    { name: "Canal no YouTube", url: "#", icon: Youtube, color: "hover:bg-red-600 hover:border-red-600" },
    { name: "Meu GitHub", url: "#", icon: Github, color: "hover:bg-slate-700 hover:border-slate-700" },
    { name: "LinkedIn Profissional", url: "#", icon: Linkedin, color: "hover:bg-blue-600 hover:border-blue-600" },
    { name: "Materias de Estudo", url: "/materiais", icon: BookOpen, color: "hover:bg-purple-600 hover:border-purple-600" },
    { name: "Ler meus Artigos", url: "/blog", icon: BookOpen, color: "hover:bg-emerald-600 hover:border-emerald-600" },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-md px-6 py-12 mx-auto">
      <img src="https://avatars.githubusercontent.com/u/69542454?v=4" className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse" />
      <h1 className="text-2xl font-bold text-white">Ronald Andrade</h1>
      <p className="text-slate-400 mb-8 text-center"> Cientista de Dados & Matemático.</p>

      <div className="w-full space-y-3">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            className={`flex items-center justify-center gap-3 w-full p-4 border border-slate-700 rounded-lg text-slate-200 font-medium transition-all ${link.color} hover:text-white`}
          >
            <link.icon size={20} />
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}