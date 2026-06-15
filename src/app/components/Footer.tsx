import Link from "next/link";
import { Github, Linkedin, Youtube, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Lado Esquerdo: Marca e Direitos */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold text-foreground">Ronald<span className="text-primary">.Math</span></h3>
          <p className="text-sm text-muted-foreground mt-2">
            © {currentYear} Ronald Andrade. <br className="hidden md:block" />
            Explorando a beleza da lógica.
          </p>
        </div>

        {/* Lado Direito: Sociais */}
        <div className="flex gap-6">
          <Link href="https://youtube.com/@ronaldandrade5395?si=6s2UynVKMm69tl1v" className="text-muted-foreground hover:text-foreground transition-colors">
            <Youtube size={20} />
            <span className="sr-only">YouTube</span>
          </Link>
          <Link href="https://www.linkedin.com/in/ronaldandrademendonca/" className="text-muted-foreground hover:text-foreground transition-colors">
            <Linkedin size={20} />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link href="https://github.com/ronaldandrade" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github size={20} />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="mailto:mendoncapy@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
            <Mail size={20} />
            <span className="sr-only">Email</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}