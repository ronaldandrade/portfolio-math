import { NextResponse } from 'next/server'
// Importe a função que criamos no passo anterior
import { createClient } from '@/lib/supabase/server' 

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Se houver um parâmetro 'next', redireciona para ele, senão vai para /materiais
  const next = searchParams.get('next') ?? '/materiais'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se der erro, manda de volta para o login com uma mensagem de erro
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}