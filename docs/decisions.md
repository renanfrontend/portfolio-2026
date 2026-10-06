# Decisões técnicas

Registro das escolhas relevantes feitas durante a implementação do MVP (06/10/2026).

## Ambiente e versões

Projeto novo criado com `create-next-app@latest` em `C:\Projetos\renan-portfolio` (não havia projeto anterior nesta pasta; os outros diretórios de `C:\Projetos` não foram alterados). Gerenciador: npm, com um único `package-lock.json`.

| Pacote | Versão |
| --- | --- |
| Node.js (local) | 24.21.0 |
| next / eslint-config-next | 16.4.0 |
| react / react-dom | 19.3.0 |
| tailwindcss / @tailwindcss/turbopack | 4.x (4.3.3) |
| typescript | 5.x (o scaffold fixou ^5; a 7.0 é a mais recente, mas não foi adotada para manter compatibilidade com o Next) |
| zod | 4.6.5 |
| vitest | 5.0.3 |
| @playwright/test | 1.63.0 |
| @types/node | 24.x (o ^20 do scaffold conflitava com o peer do Vitest 5) |

## Next.js 16.4

- **Cache Components e Partial Prefetching** vêm ativos no scaffold e foram mantidos. Consequências:
  - Leitura de `searchParams` fica em Client Components dentro de `Suspense` (filtros de projetos, parâmetro `?servico`). O shell estático da listagem mostra todos os projetos; os filtros entram no cliente.
  - O formulário de contato não fica dentro do `Suspense`: um leitor isolado (`ServiceParamReader`) informa o serviço da URL. Isso evita que o formulário seja recriado na hidratação e apague o que a pessoa já digitou (bug encontrado nos testes E2E).
  - `Date` em Server Components exige `"use cache"` (ano do rodapé).
- **`proxy.ts`** (nome novo do middleware) trata a entrada sem idioma e **valida slugs de projetos e serviços**. Motivo: com o shell pré-renderizado, o `notFound()` de um slug desconhecido acontecia depois do início do streaming e respondia **200**. O proxy reescreve slugs desconhecidos para uma rota inexistente, o que gera **404** real. Pela mesma razão, `projetos/loading.tsx` foi removido.
- **Layout raiz em `app/[locale]/layout.tsx`**, com `lang` validado. URLs fora das rotas (incluindo idiomas inválidos) usam `app/global-not-found.tsx` (flag experimental `globalNotFound`), bilíngue porque o idioma é desconhecido.
- Tailwind 4 via loader `@tailwindcss/turbopack` (padrão do scaffold), com tokens no `globals.css` e `@theme inline`.

## Arquitetura

- Conteúdo em módulos TypeScript (`src/content`). Dados que não mudam entre idiomas (links, imagens, tecnologias) ficam em `projects-base.ts`; textos traduzidos em `content/<idioma>/`. Slugs são estáveis entre idiomas.
- Textos de interface em `src/i18n/messages/*.json`; o tipo do inglês é verificado contra o português (`satisfies Dictionary`).
- Estado conforme o roadmap: idioma na URL, filtros em search params, tema no `ThemeProvider` (escolha `dark | light | system` em `localStorage`, tema exibido derivado), menu e formulário com estado local. Sem Redux/Zustand/React Query.
- Tema sem biblioteca: script inline antes da pintura aplica `data-theme` (sem flash) e `useSyncExternalStore` lê a escolha (sem divergência de hidratação).
- FAQ com `<details>` nativo (acessível sem JavaScript), sem biblioteca de acordeão.
- React Hook Form não foi instalado: o formulário é simples e usa estado local + o mesmo schema Zod do servidor.

## Contato

- Fluxo: `ContactForm` → `POST /api/contact` → limite de requisições → validação Zod → adaptador de e-mail → resposta estruturada (200, 400, 413, 429, 503, 500).
- Adaptadores: `resend` (API HTTP, sem SDK) e `test` (memória, usado nos E2E). Sem configuração, o endpoint responde **503** e a interface oferece o e-mail como alternativa. Nunca há sucesso fictício.
- Limitador: Upstash Redis via REST quando configurado; senão, memória local (documentado como insuficiente em serverless, pois cada instância tem a própria memória). O IP vira hash antes de ser usado como chave.
- Logs não registram corpo da mensagem nem dados pessoais (há teste para isso).
- Armadilha de robôs (campo `website`) e limite de 16 KB por requisição.

## Identidade visual

- A referência (rafalmeida.com.br) inspirou a estrutura (hero com nome em destaque, retrato interativo, abertura). A pedido do Renan, a linguagem visual foi diferenciada para não parecer cópia:
  - Paleta grafite esverdeada com destaque **turquesa** e apoio **violeta** (a referência usa azul).
  - Tipografia de títulos **Space Grotesk** (a referência usa Montserrat); corpo em Inter.
  - Retrato em **chuva de caracteres estilo Matrix** (pedido do Renan): katakana, dígitos e símbolos de código em grade; a chuva revela o retrato por onde passa e o brilho de cada caractere vem da foto (curva em S para destacar olhos e barba). Diferencial próprio: o cursor é uma **lente que decodifica** os caracteres em um trecho legível de TypeScript sobre o Renan. Visual do filme: verde fósforo, katakana espelhado, cabeça das gotas quase branca com brilho, duas gotas por coluna. Grade de 100 colunas (64 no celular) para o rosto ficar legível; os caracteres são pré-desenhados em um atlas e só as células que mudam são redesenhadas (cerca de 60 fps medidos). Sem moldura: desenhado sobre o fundo do site com máscara radial nas bordas; no tema claro usa verdes escuros e inverte o mapeamento de brilho. Pausa fora da tela e fica estático com movimento reduzido. Uma versão anterior em meio-tom (halftone) foi substituída.
  - **Abertura** com monograma "RA" em matriz de pontos e log de terminal que acompanham etapas reais (fontes, retrato, página), saída em íris. A referência usa número grande, barra e partículas.
  - Rótulos de seção no estilo comentário de código (`// competências`).
- Foto: avatar público do GitHub do Renan (autorizado por ele). O fundo é removido por uma máscara de silhueta aproximada (`src/features/home/portrait-sampling.ts`).
- Movimento: retrato e abertura respeitam `prefers-reduced-motion` (retrato estático; abertura desligada). A abertura aparece uma vez por sessão, pode ser pulada (botão ou Esc) e some sozinha via CSS se o JavaScript falhar.

## Conteúdo

- Fonte dos dados profissionais: README do perfil `renanfrontend`, repositório público `renan-portfolio` (portfólio anterior do Renan) e o currículo em PDF dele. Os PDFs e screenshots foram copiados desse repositório; LogiFlow 3D e VisionStock foram capturados das demonstrações públicas (`scripts/capture-screenshots.mjs`).
- Anos de experiência: **6+** (desde fev/2020, conforme o currículo). O README do GitHub diz "7+"; prevaleceu a data verificável.
- Projetos: apenas repositórios públicos (exceto o MWM Portal, profissional, sem links nem imagens, com o texto que o próprio Renan já publicou). Não foram incluídos números de certificações nem métricas de projetos.
- Projetos pessoais e de estudo aparecem identificados como tal.
