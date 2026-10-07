# Pagamentos, webhook e métricas

Fluxo de contratação em `/[locale]/contratar`:

1. "Contratar Serviço" abre o modal; o formulário é validado no navegador e de novo no servidor.
2. `POST /api/pre-contratacao` monta o pedido (`RA-XXXXXX-XXX`) com o preço do arquivo central
   (`src/content/packages.ts`), cria a sessão do **Stripe Checkout** e avisa o Renan por e-mail.
3. O navegador vai para a página segura do Stripe (cartão, Pix ou boleto).
4. O Stripe chama `POST /api/webhooks/stripe`, que marca o pedido como pago e envia os e-mails
   (cliente e Renan).
5. O cliente volta para `/[locale]/contratar/sucesso`, que consulta a sessão no Stripe antes de
   mostrar "Pagamento confirmado".

Sem `STRIPE_SECRET_KEY` (ou se o Stripe falhar), o pedido continua registrado por e-mail e o modal
oferece o WhatsApp. Cancelar no Stripe volta para `/[locale]/contratar?cancelado=1`.

| Pacote | Cobrança |
| --- | --- |
| Diagnóstico Técnico, Pacote de Horas | Avulsa (`mode: payment`): cartão, Pix, boleto |
| Suporte Mensal | Assinatura mensal (`mode: subscription`): só cartão |
| Setup / MVP | Sem checkout: conversa pelo WhatsApp (escopo varia) |

## Decisões

- **Checkout hospedado, sem `@stripe/stripe-js`**: o servidor devolve `session.url` e o navegador
  só redireciona. O `redirectToCheckout` do Stripe.js não é mais o caminho recomendado, e não
  carregar o script deixa a página mais leve. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` fica no
  `.env.example` para uma futura integração com Elements.
- **`allowed_payment_method_types`**: na versão da API instalada (stripe 23, `2026-09-30`),
  ele substitui `payment_method_types` e filtra os métodos ativos no painel. Um método que não
  estiver ativo na conta simplesmente não aparece.
- **Pix e boleto são assíncronos**: `checkout.session.completed` chega com `payment_status: unpaid`
  (pedido "pendente") e o pagamento só se confirma em `checkout.session.async_payment_succeeded`.
- **Status do pedido**: o Stripe é a fonte oficial (painel e página de sucesso). O site guarda só o
  status (`paid`, `pending`, `failed`) no Upstash Redis (`order:status:<pedido>`, 180 dias), o que
  evita e-mails repetidos quando o Stripe reenvia um evento. Sem Upstash, usa memória (só para
  desenvolvimento).
- **Rota de sucesso**: fica em `/contratar/sucesso` (e não em `/servicos/sucesso`) porque o modal
  vive em `/contratar` e `/servicos/[slug]` já é a página de cada serviço.

## Configuração em produção (Vercel)

1. Painel do Stripe → **Configurações → Métodos de pagamento**: ativar Cartão, Pix e Boleto.
   Parcelamento: ativar na conta e definir `STRIPE_CARD_INSTALLMENTS=true`.
2. **Desenvolvedores → Webhooks → Adicionar endpoint**:
   `https://www.renanaugusto.com.br/api/webhooks/stripe`, com os eventos
   `checkout.session.completed`, `checkout.session.async_payment_succeeded` e
   `checkout.session.async_payment_failed`. Copiar o segredo `whsec_...`.
3. Na Vercel (Settings → Environment Variables): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_APP_URL=https://www.renanaugusto.com.br`, `NEXT_PUBLIC_GA_ID` e, se houver,
   `NEXT_PUBLIC_SCHEDULING_URL` (Cal.com/Calendly). Recomendado: `UPSTASH_REDIS_REST_URL/TOKEN`.
4. Comece com as chaves de teste (`sk_test_`) e troque pelas de produção (`sk_live_` e o
   `whsec_` do endpoint de produção) só depois de testar.

## Teste local (modo de teste do Stripe)

1. Em `.env.local`: `STRIPE_SECRET_KEY=sk_test_...` e `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
   Para receber os e-mails de verdade, use `EMAIL_PROVIDER=resend` com a chave do Resend;
   com `EMAIL_PROVIDER=test` eles ficam só na memória do servidor.
2. Instale a [Stripe CLI](https://docs.stripe.com/stripe-cli) e encaminhe os eventos:

   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copie o `whsec_...` que o comando mostra para `STRIPE_WEBHOOK_SECRET` e reinicie o `npm run dev`.
3. Abra `http://localhost:3000/pt-BR/contratar`, escolha um pacote e preencha o modal.
4. No Checkout de teste:
   - Cartão aprovado: `4242 4242 4242 4242`, qualquer validade futura, qualquer CVC.
   - Cartão recusado: `4000 0000 0000 0002`.
   - Autenticação 3DS: `4000 0025 0000 3155`.
   - Pix e boleto: no modo de teste, o Stripe simula a confirmação depois de alguns segundos.
5. Confira:
   - O terminal do `stripe listen` mostra `checkout.session.completed` com resposta `[200]`.
   - A página `/pt-BR/contratar/sucesso` mostra "Pagamento confirmado" com o número do pedido.
   - Com o Resend ligado, chegam o e-mail de pedido pago para o Renan e o de confirmação para o
     e-mail usado no modal.
6. Reenviar um evento (`stripe events resend evt_...`) não gera e-mail duplicado.

## Google Analytics 4

Com `NEXT_PUBLIC_GA_ID=G-...`, o site carrega o gtag depois da hidratação e envia:

| Evento | Quando |
| --- | --- |
| `open_service_modal` | Modal aberto (`package_id`, `package_name`) |
| `submit_lead_form` | Pré-contratação aceita pelo servidor (`value`, `currency`) |
| `begin_checkout` | Antes de ir ao Stripe (espera até 600 ms o envio, depois segue) |
| `purchase_success` | Página de sucesso com pagamento confirmado (uma vez por pedido) |

Para tratar `purchase_success` como conversão: GA4 → Administrador → Eventos → marcar como evento
principal. Sinais do Google e personalização de anúncios ficam desligados; a política de
privacidade descreve o uso.
