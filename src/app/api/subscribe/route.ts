import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, source } = await request.json();

    // 1. Validação básica
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // 2. Tenta salvar no Supabase
    const { error } = await supabase
      .from("leads")
      .insert([{ email, source: source || "site-geral" }]);

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}