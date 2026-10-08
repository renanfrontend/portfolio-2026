# Checklist: ligar os pagamentos em produção

> **Quando fazer:** assim que o Stripe terminar a análise da conta (aviso "Análise em andamento",
> iniciada em 07/10/2026, prazo de 2 a 3 dias úteis).
> Detalhes técnicos do fluxo: [payments.md](payments.md).

**Situação em 07/10/2026**

- Código pronto e testado de ponta a ponta no modo de teste (modal → Stripe Checkout → webhook →
  "Pagamento confirmado"), na branch `feature/pagina-servicos`.
- Ainda **não** está na `main`: o site oficial não tem a página `/contratar`.
- Sem as chaves do Stripe, o site funciona normalmente: o modal registra o pedido por e-mail e
  oferece o WhatsApp. Por isso a branch pode ir para a `main` antes ou depois deste checklist.

---

## 0. Já dá para fazer (não depende da análise)

- [ ] **Rotacionar a chave de teste** que apareceu na conversa com o Claude: Stripe → Modo de teste →
      Desenvolvedores → Chaves de API → chave secreta → **Rotacionar**.
      Atualizar `STRIPE_SECRET_KEY` no `.env.local` local com a chave nova.
- [ ] **Chave de teste na prévia:** Vercel → `portfolio-2026` → Settings → Environment Variables →
      `STRIPE_SECRET_KEY` = `sk_test_...` (nova), marcar **apenas Preview** → Redeploy da prévia.
- [ ] **Testar na prévia** (passo a passo em [payments.md](payments.md#teste-na-prévia-da-vercel-branch-featurepagina-servicos)):
      cartão `4242 4242 4242 4242`, validade `12/30`, CVC `123` → deve abrir "Pagamento confirmado".
- [ ] **Upstash Redis (recomendado):** Vercel → Storage → Upstash → Create → conectar ao projeto
      (cria `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`) em Production e Preview.
- [ ] **Google Analytics 4 (opcional):** analytics.google.com → Propriedade → Fluxo de dados Web
      (`www.renanaugusto.com.br`) → copiar o ID `G-...`.
- [ ] **Agendamento do kickoff (opcional):** criar um evento no Cal.com ou Calendly e guardar o link.

## 1. Stripe, no modo real (depois da análise)

Confira que o canto superior esquerdo **não** mostra "Modo de teste".

- [ ] **Dados públicos:** Configurações → Empresa → Dados públicos
  - [ ] Descrição no extrato: `RENANAUGUSTO.COM.BR`
  - [ ] Site: `https://www.renanaugusto.com.br`
  - [ ] E-mail de suporte: `contato@renanaugusto.com.br`
- [ ] **Métodos de pagamento:** Configurações → Métodos de pagamento → ativar **Cartão**, **Pix**,
      **Boleto** e, se quiser, o **parcelamento** do cartão.
- [ ] **Webhook:** Desenvolvedores → Webhooks → Adicionar destino
  - URL: `https://www.renanaugusto.com.br/api/webhooks/stripe`
  - Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
    `checkout.session.async_payment_failed`
  - [ ] Copiar o **segredo de assinatura** (`whsec_...`)
- [ ] **Chave secreta real:** Desenvolvedores → Chaves de API → copiar `sk_live_...`
      (nunca colar em chat, e-mail ou código; só na Vercel).

## 2. Vercel, ambiente Production

Settings → Environment Variables (marcar **Production**):

| Variável | Valor |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` do webhook acima |
| `NEXT_PUBLIC_APP_URL` | `https://www.renanaugusto.com.br` |
| `STRIPE_CARD_INSTALLMENTS` | `true` (só se ativou o parcelamento) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-...` (opcional; pode já estar configurada pela gestão de tráfego) |
| `NEXT_PUBLIC_SCHEDULING_URL` | link do Cal.com ou Calendly (opcional) |

- [ ] Conferir se já existem `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` e `CONTACT_FROM_EMAIL`
      (usados pelo formulário de contato e pelos e-mails de pedido).
- [ ] **Nunca** colocar `sk_test_` em Production nem `sk_live_` em Preview.

## 3. Publicar

- [ ] Pedir ao Claude: "pode fazer o merge da feature/pagina-servicos na main". Ele roda a validação
      completa, faz o merge e confere o site no ar.
- [ ] Se a branch já estiver na `main`: Vercel → Deployments → produção → **Redeploy** (para ler as
      variáveis novas).

## 4. Conferir em produção

- [ ] `https://www.renanaugusto.com.br/pt-BR/contratar` → "Contratar Serviço" abre o modal.
- [ ] Fazer **uma compra real de valor baixo** para validar (ou o próprio Diagnóstico) e depois
      **reembolsar** no Stripe: Transações → pagamento → Reembolsar.
  - [ ] Abriu o checkout com o nome da empresa e **sem** a etiqueta "Área restrita".
  - [ ] Voltou para "Pagamento confirmado".
  - [ ] Chegou o e-mail "Pedido ... PAGO" para você e o de confirmação para o cliente.
  - [ ] Stripe → Webhooks → o endpoint mostra entregas com status **200**.
- [ ] GA4 → Relatórios → Tempo real: aparecem `open_service_modal`, `begin_checkout` e
      `purchase_success`. Marcar `purchase_success` como **evento principal** (conversão).

## Se algo der errado

| Sintoma | Causa provável |
| --- | --- |
| Modal oferece WhatsApp em vez de ir ao pagamento | `STRIPE_SECRET_KEY` ausente nesse ambiente, ou falta Redeploy |
| Webhook com erro 400 no Stripe | `STRIPE_WEBHOOK_SECRET` diferente do segredo desse endpoint |
| Webhook com erro 503 | `STRIPE_WEBHOOK_SECRET` não configurado em Production |
| Webhook com erro 401 | Endpoint apontando para uma prévia protegida, e não para o domínio oficial |
| Pix ou boleto não aparecem no checkout | Método não ativado no painel do Stripe (modo real) |
| "Pagamento confirmado" não aparece, mas o Stripe cobrou | Ver os logs da Vercel (`[sucesso]`) e o pagamento no painel; o e-mail do webhook confirma o pedido |
