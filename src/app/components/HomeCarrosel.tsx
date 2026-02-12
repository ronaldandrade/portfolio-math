"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, BookOpen, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

// 1. AQUI ESTÁ A CORREÇÃO: Definimos o que o componente aceita receber
interface CarouselProps {
  latestPost?: {
    title: string;
    description: string;
    slug: string;
    date?: string;
    tags?: string[];
  } | null;
  latestVideo?: {
    title: string;
    description: string;
    url: string;
    thumb?: string;
  } | null;
  latestMaterial?: {
    title: string;
    description: string;
    fileUrl: string;
    type?: string;
  } | null;
}

// 2. AQUI INJETAMOS AS PROPS NA FUNÇÃO
export default function HomeCarousel({ latestPost, latestVideo, latestMaterial }: CarouselProps) {
  
  // Montamos os slides dinamicamente. Se algum dado for null, o slide não é criado.
  const slides = [
    latestVideo && {
      id: 1,
      type: "VÍDEO NOVO",
      icon: PlayCircle,
      title: latestVideo.title,
      description: latestVideo.description,
      cta: "Assistir Agora",
      link: "/conteudos", // Ou link direto se preferir
      color: "text-red-400",
      bg: "bg-gradient-to-br from-red-900/20 to-background"
    },
    latestMaterial && {
      id: 2,
      type: "MATERIAL DE ESTUDO",
      icon: BookOpen,
      title: latestMaterial.title,
      description: latestMaterial.description,
      cta: "Baixar Material",
      link: "/materiais",
      color: "text-emerald-400",
      bg: "bg-gradient-to-br from-emerald-900/20 to-background"
    },
    latestPost && {
      id: 3,
      type: "BLOG RECENTE",
      icon: FileText,
      title: latestPost.title,
      description: latestPost.description,
      cta: "Ler Artigo",
      link: `/blog/${latestPost.slug}`,
      color: "text-blue-400",
      bg: "bg-gradient-to-br from-blue-900/20 to-background"
    }
  ].filter((slide): slide is NonNullable<typeof slide> => Boolean(slide)); 
  // O filter acima remove os 'null' e garante ao TypeScript que o array só tem objetos válidos

  const [index, setIndex] = useState(0);

  // Timer para rodar o carrossel
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Se não tiver nada (nem post, nem vídeo, nem material), não renderiza nada
  if (slides.length === 0) return null;

  const currentSlide = slides[index];

  return (
    <div className="w-full max-w-4xl mx-auto h-[300px] relative overflow-hidden rounded-2xl border border-border shadow-2xl mt-12 mb-20 bg-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 ${currentSlide.bg}`}
        >
          <div className={`flex items-center gap-2 mb-4 font-mono text-xs tracking-widest font-bold ${currentSlide.color}`}>
            <currentSlide.icon size={16} />
            {currentSlide.type}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 line-clamp-1">
            {currentSlide.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mb-8 line-clamp-2">
            {currentSlide.description}
          </p>

          <Link 
            href={currentSlide.link}
            className="flex items-center gap-2 text-foreground font-semibold hover:gap-4 transition-all w-fit group"
          >
            {currentSlide.cta}
            <ChevronRight size={18} className={`group-hover:${currentSlide.color}`} />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Indicadores (Bolinhas) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground w-2"
            }`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}