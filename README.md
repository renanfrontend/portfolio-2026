# Renan Augusto: portfólio e consultoria

Site profissional de Renan Augusto dos Santos, desenvolvedor frontend sênior: apresentação, projetos com estudos de caso, serviços de consultoria e formulário de contato, em português (`/pt-BR`) e inglês (`/en`).

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript estrito · Tailwind CSS 4 · Zod · Vitest · Playwright.

## Requisitos

- Node.js 20.9 ou superior (desenvolvido com 24.21) e npm.
- Para os testes E2E: Microsoft Edge (Windows) ou o Chromium do Playwright (`npx playwright install chromium`).

## Começando

```bash
npm install
cp .env.example .env.local   # opcional em desenvolvimento
npm run dev                  # http://localhost:3000 → redireciona para /pt-BR
```

Sem variáveis de e-mail, o site funciona normalmente e o formulário informa que o envio está indisponível, oferecendo o e-mail como alternativa. Para testar o envio localmente sem mandar nada, use `EMAIL_PROVIDER=test` no `.env.local`.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run start` | Build de produção e servidor |
| `npm run lint` | ESLint (regras do Next.js + TypeScript) |
| `npm run typecheck` | Gera os tipos de rotas e roda `tsc --noEmit` |
| `npm test` | Testes unitários (Vitest): contrato do contato, endpoint, limitador, filtros e parâmetros |
| `npm run build:check` | Build de produção em `.next-check`, sem interferir em um `npm run dev` aberto |
| `npm run test:e2e` | Testes E2E (Playwright) contra esse build; rode `npm run build:check` antes |
| `npm run validate` | lint + typecheck + testes unitários + build |

## Estrutura

```text
src/
  app/[locale]/            layout raiz (lang validado), 404 por idioma, imagem OG
    (site)/                header, footer, abertura e páginas: início, sobre, projetos, serviços, contato, privacidade
  app/api/contact/         endpoint do formulário
  app/global-not-found.tsx 404 para URLs sem rota (inclui idiomas inválidos)
  proxy.ts                 redireciona "/" e valida slugs (404 real)
  components/              ui, layout e componentes compartilhados (tema, idioma, abertura...)
  features/                regras por funcionalidade: home, about, projects, services, contact
  content/                 conteúdo editorial tipado (pt-BR e en)
  i18n/                    idiomas e textos de interface
  lib/server/              env, e-mail e limitador (somente servidor)
docs/                      decisões, checklist editorial e publicação
tests/unit, tests/e2e      testes
```

## Editando o conteúdo

Veja [docs/content-checklist.md](docs/content-checklist.md). Resumo:

- Textos de interface: `src/i18n/messages/pt-BR.json` e `en.json`.
- Perfil, experiência e formação: `src/content/<idioma>/profile.ts`.
- Projetos: `src/content/projects-base.ts` (links, imagens, tecnologias) + `src/content/<idioma>/projects.ts` (textos). Imagens em `public/images/projects/`; `scripts/capture-screenshots.mjs` captura telas das demos públicas.
- Serviços: `src/content/<idioma>/services.ts` (mesmo `slug` nos dois idiomas).
- Currículo: `public/documents/` (o botão só aparece se o arquivo existir).

## Variáveis de ambiente

Documentadas em [.env.example](.env.example). Credenciais ficam só no servidor; nada com prefixo `NEXT_PUBLIC_` é secreto.

## Publicação

Veja [docs/deployment.md](docs/deployment.md). Decisões técnicas em [docs/decisions.md](docs/decisions.md).
