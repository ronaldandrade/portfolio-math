import { Github, Linkedin, Youtube } from "lucide-react";

const links = [
  { name: "Canal no YouTube", url: "https://youtube.com/@ronaldandrade5395?si=6s2UynVKMm69tl1v", icon: Youtube, color: "hover:text-red-500" },
  { name: "GitHub", url: "https://github.com/ronaldandrade", icon: Github, color: "hover:text-white" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/ronaldandrademendonca/", icon: Linkedin, color: "hover:text-blue-500" },
];

export default function LinksPage() {
  return (
    <div className="max-w-md mx-auto py-20 px-4 flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-surface rounded-full mb-6 border-2 border-primary/20" /> {/* Avatar Placeholder */}
      <h1 className="text-2xl font-bold text-text">Ronald Andrade</h1>
      <p className="text-muted mb-8">Data Science & Matemática</p>
      
      <div className="w-full space-y-4">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-3 w-full p-4 bg-surface border border-muted/20 rounded-xl transition-all hover:scale-[1.02] hover:border-primary/40 text-text group`}
          >
            <link.icon className={`w-5 h-5 transition-colors ${link.color}`} />
            <span className="font-medium">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}