# Roteiro do agente editorial do Rams.Log

Como o agente funciona, por que cada peça existe e como usar, testar e evoluir.

## 1. Mapa das peças

| Arquivo | Tipo | Quando é carregado | Função |
|---|---|---|---|
| `CLAUDE.md` | instruções do projeto | sempre, ao abrir o Claude Code no repo | papel, fluxo, regras inegociáveis, voz |
| `.claude/commands/post.md` | comando `/post <slug>` | quando você digita | dispara o fluxo inteiro |
| `.claude/skills/ramslog-extrair-afirmacoes/` | skill | etapa 2 | notas → `afirmacoes.json` |
| `.claude/skills/ramslog-checagem/` | skill | etapa 3, dentro do subagente | `afirmacoes.json` → `checagem.md` |
| `.claude/agents/fact-checker.md` | subagente | etapa 3 | executa a checagem em contexto isolado |
| `.claude/skills/ramslog-mdx/` | skill + template + script | etapas 5 e 6 | escreve e valida o `.mdx` |
| `.claude/skills/ramslog-publicar/` | skill + script | etapa 8 | branch, commit, push, PR |
| `.claude/hooks/validar_apos_edicao.sh` | hook | após todo Write/Edit em `src/content/posts/*.mdx` | roda o validador e devolve o erro ao agente |
| `.claude/settings.json` | permissões + hooks | sempre | bloqueia push na main, force push e merge |

## 2. Por que está dividido assim

**CLAUDE.md curto, skills longas.** O CLAUDE.md entra no contexto em toda conversa; cada linha nele custa sempre. As skills só são carregadas quando a etapa delas chega. A regra prática: no CLAUDE.md fica o que vale para *qualquer* tarefa no repo; procedimento de uma etapa vai para a skill da etapa.

**A `description` da skill é o gatilho.** O agente decide carregar uma skill lendo só a descrição. Descrição vaga = skill que não é usada ou é usada na hora errada. Por isso cada uma diz *o que faz* e *quando usar*.

**Extração separada da checagem.** Se a mesma chamada extrai e julga, ela tende a extrair só o que consegue confirmar. Separando, a extração é exaustiva e a checagem trabalha numa lista fechada, auditável pelo ID.

**Subagente para checar.** O fact-checker não vê o rascunho, só a lista de afirmações. Quem leu o texto inteiro, com a argumentação do autor, tende a concordar com ele. O isolamento é a peça que torna a checagem independente. Bônus: as buscas e execuções de código dele não poluem o contexto do agente principal.

**Status ❓ explícito.** Sem ele, "não encontrei" vira "confirmado" por omissão. É o erro mais comum de agente de checagem.

**Validador em código, não em instrução.** As regras de formato (data entre aspas, sem H1, componentes permitidos, imagens existentes, MDX que compila) são determinísticas. O script não esquece nenhuma; o LLM eventualmente esquece. O hook faz o agente receber o erro sozinho logo após escrever, e corrigir antes de chegar até você.

**Permissões no `settings.json`, não só no texto.** "Nunca faça push na main" escrito no CLAUDE.md é um pedido. A regra `deny` é uma trava. As duas existem: o texto explica o motivo, a trava garante.

**PR em vez de push direto.** A Vercel cria um preview para cada PR. Você revisa o post renderizado (KaTeX, tabelas, imagens) antes de ir ao ar. O merge é o único passo manual.

## 3. Calibração do validador

Rodei o validador nos 9 posts publicados:

- `readingTime` usa 150 palavras/min de prosa (código e fórmulas excluídos). Com esse valor, a estimativa bate exatamente com os dois posts mais recentes (15 e 12 min). Os posts de fevereiro e junho declaram quase o dobro do estimado; o validador só avisa.
- Os posts antigos falham na regra "sem H1" porque abrem com `# Introdução`. A página já renderiza o `title` como H1, então eles têm dois H1. Os dois mais recentes já seguem o padrão novo.

Problemas reais encontrados no blog publicado:

| Post | Problema |
|---|---|
| `redes_neurais_profundas` | a imagem `/redes_neurais_profundas.png` não existe em `public/`: imagem quebrada no site |
| `calculo_deep_learning` | três imagens ainda com texto alternativo "Espaço para imagem: …" (placeholder publicado) |
| 7 posts antigos | H1 duplicado (`# Introdução`) |

## 4. Instalação

Pré-requisitos no computador onde o agente roda: Claude Code, Node, `npm ci` feito no repo, GitHub CLI (`gh auth login` feito).

1. Copiar `CLAUDE.md` e `.claude/` para a raiz do repositório `portfolio-math`.
2. Dar permissão de execução: `chmod +x .claude/hooks/*.sh .claude/skills/*/scripts/*.sh`.
3. Criar a pasta de notas fora do repo: `mkdir -p ~/ramslog-notas`. Para outro local, exportar `RAMSLOG_NOTAS` no `~/.bashrc`.
4. Commitar `CLAUDE.md` e `.claude/` no repo. Nada ali é secreto, e assim o agente vai junto para qualquer máquina que clonar o repo.
5. Abrir o Claude Code na raiz do repo e conferir com `/agents` (deve listar `fact-checker`) e com uma pergunta tipo "quais skills você tem?".

## 5. Uso

```
~/ramslog-notas/
└── transformers_atencao/
    ├── notas.md          ← você escreve
    ├── afirmacoes.json   ← agente
    ├── checagem.md       ← fact-checker
    └── decisoes.md       ← agente, a partir das suas respostas no GATE 1
```

No Claude Code: `/post transformers_atencao`.

Pontos em que ele para e espera você:
- **GATE 1**: mostra o que está ❌, ⚠️ ou ❓. Você responde item a item ("A07 aceita, A12 mantém, A15 tira do post").
- **GATE 2**: mostra o frontmatter e os avisos do validador. Você responde "pode publicar".
- **Merge do PR**: no GitHub, depois de olhar o preview.

## 6. As notas no seu site de anotações

Hoje o agente lê `notas.md` de uma pasta local. Isso é proposital: a entrada é um contrato (um arquivo Markdown por post), e a origem fica plugável.

Quando você decidir, há três caminhos, do mais simples ao mais integrado:

1. **Exportar**: o site ganha um botão "baixar .md" e você salva em `~/ramslog-notas/<slug>/notas.md`.
2. **Script de sincronização**: se o site guarda as notas num banco (Supabase, por exemplo), um script `baixar_notas.mjs <slug>` busca a nota pela API e grava o `notas.md`. O agente chama o script na etapa 1.
3. **Servidor MCP**: o site expõe as notas como ferramenta MCP e o agente lê direto. Só vale a pena se outros agentes também forem usar as notas.

Para escolher, preciso saber como esse site guarda as notas (banco, arquivos, qual stack).

## 7. Testar o agente

Um agente sem teste é um agente em que você confia por fé. Teste mínimo:

1. Copie as notas de um post antigo e **plante 3 erros**: um número de parâmetros errado, um ano errado e um bug num trecho de código.
2. Rode `/post teste_erros`.
3. Critério de aprovação: os três aparecem como ❌ no GATE 1, com fonte. Se algum passar como ✅, ajuste `criterios.md` e repita.

Repita esse teste sempre que mexer nas skills de extração ou checagem.

## 8. Molde para os próximos agentes

O que se reaproveita para qualquer agente do dia a dia:

1. **Escreva o fluxo antes do prompt.** Etapas, entrada e saída de cada uma, e onde há decisão humana.
2. **Classifique cada etapa:** determinística (vira script), julgamento (vira skill), irreversível (vira gate + trava em `settings.json`).
3. **Isole o que precisa ser independente** num subagente com contexto mínimo.
4. **Faça cada etapa deixar um arquivo** que você consiga abrir e auditar.
5. **Teste com erros plantados** antes de confiar.
