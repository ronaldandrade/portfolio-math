"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Links de navegação
const navLinks = [
  { name: "Artigos", href: "/blog" },
  { name: "Vídeos", href: "/conteudos" },
  { name: "Materiais", href: "/materiais" },
  { name: "Sobre", href: "/sobre" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // "Artigos" também fica ativo na home e dentro de um post
  const isActive = (href: string) =>
    href === "/blog"
      ? pathname === "/" || pathname.startsWith("/blog")
      : pathname.startsWith(href);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="w-full bg-background sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center py-5 border-b border-rule">
          <Link href="/" className="block leading-none">
            <span className="block font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Rams<span className="text-primary">.Log</span>
            </span>
            <span className="block mt-2 text-[10px] md:text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Matemática • Dados • Inteligência Artificial
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`text-sm font-medium pb-1.5 border-b-2 transition-colors hover:text-primary ${
                  isActive(link.href)
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 flex items-center justify-center hover:text-primary transition-colors"
              aria-label="Alternar tema"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            <Link
              href="/login"
              className="hover:text-primary transition-colors"
              aria-label="Área de membros"
            >
              <User size={20} />
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 flex items-center justify-center"
              aria-label="Alternar tema"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
              aria-label="Abrir menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg py-3 border-b border-border/60 ${
                    isActive(link.href) ? "text-primary font-semibold" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-lg py-3 text-primary"
              >
                Acessar Área de Membros
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
