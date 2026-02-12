"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Lock } from "lucide-react";
import Link from "next/link";

interface DownloadGateProps {
  fileUrl: string;
  fileName: string;
}

export function DownloadGate({ fileUrl, fileName }: DownloadGateProps) {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkUser();
  }, []);
  if (loading) return <div className="h-12 w-full bg-border/30 animate-pulse rounded-lg" />;

  // SE LOGADO: Botão de Download Direto
  if (user) {
    return (
      <a 
        href={fileUrl} 
        download 
        target="_blank"
        className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/20 transition-all font-medium"
      >
        <Download size={18} />
        Baixar {fileName}
      </a>
    );
  }

  // SE NÃO LOGADO: Botão para Login
  return (
    <div className="w-full flex flex-col gap-3">
      <Link 
        href="/login"
        className="flex items-center justify-center gap-2 w-full py-3 bg-card border border-border hover:border-primary/50 text-foreground rounded-lg transition-all group shadow-sm"
      >
        <Lock size={18} className="text-muted group-hover:text-primary" />
        <span>Login para baixar</span>
      </Link>
      <p className="text-xs text-center text-muted">
        Membros registrados baixam direto.
      </p>
    </div>
  );
}