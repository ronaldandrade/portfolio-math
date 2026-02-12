# Ronald.Math Portfolio

Este é o repositório do meu portfólio pessoal e educacional. Este projeto foi desenvolvido para unificar meus trabalhos, estudos e pesquisa, focados em Data Science, Matemática e Inteligência Artificial.

## Tecnologias (Stack)

O projeto utiliza a arquitetura mais moderna do React/Next.js:

- **Core:** [Next.js 16 (App Router)](https://nextjs.org/) - Framework React Híbrido.
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) - Tipagem estática para segurança.
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) - Design System utilitário.
- **Backend/DB:** [Supabase](https://supabase.com/) - Auth (Magic Link), Database (Postgres) e Storage.
- **Blog Engine:** MDX (Markdown + React) com `next-mdx-remote`.
- **Animações:** [Framer Motion](https://www.framer.com/motion/).
- **Ícones:** [Lucide React](https://lucide.dev/).

---

## Estrutura do Projeto

```text
/src
  /app
    /(site)           # Rotas públicas organizadas
    /api              # Endpoints (ex: captura de leads)
    /auth             # Rotas de Callback do Supabase
    globals.css       # Variáveis CSS e Configuração Tailwind
    layout.tsx        # Layout Root (Navbar, Footer, Providers)
    page.tsx          # Home Page
  /components
    /features         # Componentes lógicos (DownloadGate, etc.)
    /ui               # Componentes visuais reutilizáveis
    Navbar.tsx        # Navegação Principal
  /content
    /posts            # ARQUIVOS DO BLOG (.mdx) FICAM AQUI
  /lib
    posts.ts          # Lógica de leitura do Blog (Server Side)
    supabase          # Clientes Supabase (Client e Server)
    data.ts           # Dados estáticos (Vídeos/Materiais)
```

---

## Como Criar um Novo Post no Blog

O sistema usa **MDX**. Você escreve em Markdown e pode usar React dentro.

1. Navegue até `src/content/posts`.
2. Crie um arquivo com o nome da URL desejada, ex: `como-criar-um-post.mdx`.
3. Adicione o cabeçalho (Frontmatter) obrigatório no topo:

```markdown
---
title: 'Análise de Dados com Python'
date: '2026-03-10'
description: 'Um guia prático de como criar um post para o blog.'
tags: ['Blog', 'Markdown', 'Tutorial']
---

# Introdução

Aqui começa o seu texto. Você pode usar **negrito**, escrever fórmulas matemáticas:

$$
f(x) = x^2 + 2x + 1
$$

E blocos de código:

\`\`\`python
import pandas as pd
df = pd.read_csv('dados.csv')
\`\`\`
```

4. Salve o arquivo. O post aparecerá automaticamente na Home e na página `/blog`.

---

## Como Adicionar Materiais (PDFs)

Para disponibilizar arquivos protegidos (que exigem login/email):

1. **Upload no Supabase:**
   - Vá ao Dashboard do Supabase > **Storage**.
   - Crie um bucket público chamado `materiais` (se não existir).
   - Faça upload do arquivo PDF.
   - Clique em `Get URL` para copiar o link.

2. **Adicionar ao Site:**
   - Abra `src/lib/data.ts` (ou `src/app/materiais/page.tsx`).
   - Adicione o objeto no array:
     ```typescript
     {
       id: 99,
       title: "Nome do Material",
       fileUrl: "COLE_O_LINK_DO_SUPABASE_AQUI",
       type: "PDF"
     }
     ```

---

## Comandos Úteis

- **Rodar localmente:** `npm run dev`
- **Build de produção:** `npm run build`
- **Start produção:** `npm start`

## Variáveis de Ambiente (.env.local)

Certifique-se de que estas chaves estão configuradas no seu ambiente (Vercel ou local):

```env
NEXT_PUBLIC_SUPABASE_URL=[https://seurepo.supabase.co](https://seurepo.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn... (Chave Pública/Anon)
```

## Deploy

Este projeto está otimizado para a **Vercel**.
1. Crie um repositório no GitHub.
2. Conecte o repositório na Vercel.
3. Adicione as variáveis de ambiente nas onfigurações do projeto na Vercel.
4. Deploy automático a cada push.