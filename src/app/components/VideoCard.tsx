"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import type { Video } from "@/lib/api";

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export default function VideoCard({ video }: { video: Video }) {
  // O player só é carregado depois do clique — mantém a página leve
  const [playing, setPlaying] = useState(false);

  return (
    <div className="group">
      <div className="aspect-video w-full bg-card relative overflow-hidden">
        {playing ? (
          <iframe
            width="100%"
            height="100%"
            src={`${video.url}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full"
            aria-label={`Assistir: ${video.title}`}
          >
            {video.thumb && (
              <Image
                src={video.thumb}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <PlayCircle
                size={56}
                className="text-white drop-shadow-lg transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />
            </span>
          </button>
        )}
      </div>

      <div className="pt-4">
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(video.publishedAt)}
        </span>
        <h3 className="font-sans text-base font-semibold tracking-normal text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
      </div>
    </div>
  );
}
