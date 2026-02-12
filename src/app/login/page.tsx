"use client";

import { createClient } from "@/lib/supabase/client"; 
import { useState } from "react";
import { Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  // Instancia o cliente dentro do componente
  const supabase = createClient(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Redireciona para a nossa rota corrigida
        emailRedirectTo: `${window.location.origin}/auth/callback`, 
      },
    });

    if (error) {
      alert("Erro: " + error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };
  
  if (sent) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifique seu email</h1>
          <p className="text-muted-foreground">Enviamos um link mágico para <strong>{email}</strong>.<br/>Clique nele para entrar.</p>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-xl">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
                <ArrowLeft size={16} /> Voltar
            </Link>
          <h1 className="text-2xl font-bold mb-2 text-center">Login de Membro</h1>
          <p className="text-center text-muted-foreground mb-6">Cadastre seu email para receber acesso ao conteúdo exclusivo.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium ml-1">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Enviar Link de Acesso"}
            </button>
          </form>
        </div>
      </div>
    );
}