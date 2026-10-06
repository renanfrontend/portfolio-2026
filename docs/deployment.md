# Publicação

## Hospedagem

O endpoint `/api/contact` precisa do runtime Node.js do Next.js (não use exportação estática). Cache Components também exige Node.js. Opções compatíveis:

- **Vercel** (recomendado; detecta Next.js 16 automaticamente e preenche `VERCEL_PROJECT_PRODUCTION_URL` e `VERCEL_ENV`).
- Qualquer servidor Node.js 20.9+ com `npm run build && npm run start`.

O proxy (`src/proxy.ts`) roda no runtime Node.js.

## Passo a passo (Vercel)

1. Crie um repositório no GitHub e envie o projeto (o `.gitignore` já exclui `.env*`, exceto `.env.example`).
2. Importe o repositório na Vercel. Comando de build: `npm run build`; saída padrão.
3. Configure as variáveis (Settings → Environment Variables), conforme `.env.example`:

| Variável | Ambiente | Observação |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Domínio final, ex.: `https://renanaugusto.dev` |
| `EMAIL_PROVIDER` | Production | `resend` |
| `RESEND_API_KEY` | Production | Segredo; nunca com prefixo `NEXT_PUBLIC_` |
| `CONTACT_FROM_EMAIL` | Production | Remetente de um domínio verificado no Resend |
| `CONTACT_TO_EMAIL` | Production | Opcional; padrão `renan.gabba@gmail.com` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Production | Recomendado: limite global entre instâncias |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Todos | Opcional |

4. **Domínio e remetente**: adicione o domínio na Vercel e, no Resend, verifique o mesmo domínio (registros DNS SPF/DKIM indicados pelo painel). Sem domínio verificado, o Resend só envia a partir do endereço de teste dele.
5. Após o deploy, verifique:
   - `/` redireciona para `/pt-BR`; `/en` carrega; `/fr` responde 404.
   - `robots.txt` libera indexação e aponta para `sitemap.xml` com o domínio final.
   - Envie uma mensagem de teste pelo formulário para um destinatário autorizado e confirme o recebimento.
   - Sem as variáveis de e-mail, o formulário deve exibir a mensagem de indisponibilidade com o e-mail alternativo (comportamento esperado, não um erro).

## Prévias

Em deploys de prévia (`VERCEL_ENV=preview`), o `robots.txt` bloqueia a indexação e as páginas recebem `noindex`.

## Estado atual

**Pronto para publicar, com integração de e-mail pendente.** O código está completo e testado com o adaptador de teste; faltam definir hospedagem, domínio e credenciais do provedor de e-mail. Nenhum deploy foi feito. Enquanto o e-mail não estiver configurado, o canal de contato operacional é o e-mail público exibido no site (o formulário mostra essa alternativa).
