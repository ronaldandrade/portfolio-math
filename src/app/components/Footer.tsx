import Link from "next/link";
import { Github, Linkedin, Youtube, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="border-t border-rule py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Lado Esquerdo: Marca e Direitos */}
          <div className="text-center md:text-left">
            <h3 className="font-display text-xl font-extrabold text-foreground">
              Rams<span className="text-primary">.Log</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              © {currentYear} Ronald Andrade. Explorando a beleza da lógica.
            </p>
          </div>

          {/* Lado Direito: Sociais */}
          <div className="flex gap-6">
            <Link
              href="https://youtube.com/@ronaldandrade5395?si=6s2UynVKMm69tl1v"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Youtube size={20} />
              <span className="sr-only">YouTube</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/ronaldandrademendonca/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              href="https://github.com/ronaldandrade"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github size={20} />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="mailto:mendoncapy@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail size={20} />
              <span className="sr-only">Email</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
