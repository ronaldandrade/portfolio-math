import Link from "next/link";
import { Github, Linkedin, Youtube, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Lado Esquerdo: Marca e Direitos */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold text-slate-100">Ronald<span className="text-blue-500">.Math</span></h3>
          <p className="text-sm text-slate-500 mt-2">
            © {currentYear} Ronald Andrade. <br className="hidden md:block" />
            Explorando a beleza da lógica.
          </p>
        </div>

        {/* Lado Direito: Sociais */}
        <div className="flex gap-6">
          <Link href="#" className="text-slate-400 hover:text-white transition-colors">
            <Youtube size={20} />
            <span className="sr-only">YouTube</span>
          </Link>
          <Link href="#" className="text-slate-400 hover:text-white transition-colors">
            <Linkedin size={20} />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link href="#" className="text-slate-400 hover:text-white transition-colors">
            <Github size={20} />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="mailto:seuemail@exemplo.com" className="text-slate-400 hover:text-white transition-colors">
            <Mail size={20} />
            <span className="sr-only">Email</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}