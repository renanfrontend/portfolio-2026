# Captação orgânica e automação de pedidos

## Estado desta entrega

O código prepara medição GA4 com consentimento, identificação de pedidos por UUID, atribuição da sessão no e-mail e encaminhamento opcional para um webhook autenticado. **Não cria contas, CRM, tarefas agendadas ou conexões com Search Console.** Não ativa nada sem configuração. O formulário continua dependendo do provedor de e-mail existente.

## 1. Medição

1. Criar ou usar uma propriedade GA4 e um fluxo Web para `https://www.renanaugusto.com.br`.
2. **Desativar a medição otimizada (Enhanced Measurement) desse fluxo**, inclusive eventos de histórico, formulários e cliques externos. O site envia os eventos explicitamente; a coleta automática duplicaria visitas e poderia capturar URLs com parâmetros ou mensagens de links do WhatsApp.
3. Configurar `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...` na hospedagem e fazer novo build/deploy. O ID é público; não é uma senha.
4. Aceitar as estatísticas no site e verificar o relatório em tempo real. Sem permissão, não há script Google, eventos ou armazenamento de atribuição.
5. Marcar **somente `generate_lead` como evento principal de pedido recebido**. `whatsapp_click` e `email_click` são intenção de contato; não comprovam mensagem enviada, orçamento qualificado nem venda.

| Evento | Quando acontece |
| --- | --- |
| `page_view` | Após permissão e carregamento da tag, uma vez por mudança de caminho |
| `contact_start` | Primeiro foco no formulário |
| `contact_error` | Validação, falha de rede ou rejeição da API; apenas código de erro |
| `generate_lead` | API confirma que o provedor de e-mail aceitou o pedido |
| `whatsapp_click` | Clique em link do WhatsApp; sem número ou mensagem |
| `email_click` | Clique em link de e-mail; sem endereço ou conteúdo |
| `open_service_modal` | Modal de contratação aberto em `/contratar` (pacote) |
| `submit_lead_form` | Pré-contratação aceita pelo servidor (pacote e valor) |
| `begin_checkout` | Antes de ir ao Stripe (número do pedido, valor); espera até 600 ms e segue |
| `purchase_success` | Página de confirmação com pagamento confirmado, uma vez por pedido |

Para o funil de contratação ([payments.md](payments.md)), marcar também `submit_lead_form` (pedido de
pacote recebido) e `purchase_success` (venda) como eventos principais. Nenhum desses eventos leva nome,
e-mail, telefone ou mensagem.

Eventos aceitos não garantem entrega do e-mail na caixa de entrada. Analytics depende de permissão, disponibilidade da tag e bloqueadores; o e-mail é o registro operacional. Não envie dados pessoais em UTMs. O código aceita somente slugs de até 80 caracteres e descarta queries arbitrárias, fragmentos e URLs completas de referência. Mantém o domínio de referência e a primeira página vista após o consentimento durante a sessão da aba. Recusar estatísticas não impede contato. Não há rastreamento retroativo de visitas anteriores à permissão. O controle no rodapé permite desativar a coleta; recarrega a página e remove os cookies GA criados neste host. Desativar não apaga dados já processados pelo Google.

Exemplo para uma publicação orgânica (não representa campanha já publicada):

```text
https://www.renanaugusto.com.br/pt-BR/servicos/automacao-ia?utm_source=linkedin&utm_medium=social&utm_campaign=automacao_empresas
```

## 2. Organização dos pedidos

Cada pedido aceito recebe um ID e uma data UTC no e-mail. Quando permitidos e disponíveis, página de entrada, domínio de origem e UTMs acompanham o pedido. Nenhum novo banco de dados ou painel público de contatos foi criado.

Para encaminhar os pedidos ao sistema escolhido:

1. Preparar um endpoint HTTPS privado de CRM ou automação, por exemplo um Webhook do n8n.
2. Exigir `Authorization: Bearer <segredo>` no destino. Gerar o segredo no gerenciador de credenciais; nunca adicioná-lo ao repositório.
3. Configurar `LEADS_WEBHOOK_URL` e `LEADS_WEBHOOK_TOKEN` somente no servidor.
4. Persistir ou enfileirar o pedido **antes** de responder 2xx. Fazer upsert por `id`/`Idempotency-Key`. A confirmação HTTP é apenas aceite pelo destino, não prova conclusão de todos os passos do fluxo.
5. Mapear os campos abaixo para o CRM/planilha privada. O formulário contém dados pessoais: dar acesso somente a quem atende os pedidos.

```json
{
  "version": 1,
  "event": "lead.created",
  "id": "uuid-gerado-no-servidor",
  "createdAt": "2026-10-08T15:00:00.000Z",
  "status": "new",
  "contact": {
    "name": "Cliente de exemplo",
    "email": "cliente@example.com",
    "service": "automacao-ia",
    "message": "Gostaria de automatizar meus pedidos.",
    "locale": "pt-BR",
    "acquisition": { "landingPage": "/pt-BR", "source": "linkedin", "medium": "social" }
  }
}
```

Os pedidos de pacote em `/contratar` usam o mesmo formato, com `contact.phone` em E.164,
`contact.package` e um campo extra `order` (o número `RA-...` é o mesmo do e-mail e do Stripe):

```json
"order": { "id": "RA-ZP5AHF-042", "packageId": "diagnostico-tecnico", "amountInCents": 190000, "currency": "BRL", "checkout": "stripe" }
```

`checkout` vale `stripe` quando o cliente foi ao pagamento online e `manual` quando o pagamento será
combinado depois (Stripe ainda não configurado ou fora do ar). A confirmação do pagamento chega pelo
webhook do Stripe, não por este evento. Num pedido de pacote, se o e-mail falhar mas o Checkout já tiver
aberto, o pedido segue para o pagamento e também é enviado ao webhook (o registro fica no Stripe).

Empresa, telefone, orçamento, prazo e atribuição são opcionais. O payload é validado no servidor, mas os textos continuam sendo conteúdo não confiável: escapar HTML, tratar como texto ao gravar em planilhas e nunca executar instruções vindas da mensagem. Atribuição é declarada pelo navegador e pode estar ausente ou ser adulterada.

Fluxo a configurar no sistema escolhido: receber → gravar por ID → exibir em lista privada de oportunidades. Colunas sugeridas: ID, data, nome, empresa, serviço, orçamento, prazo, origem, status, próxima ação. Estados sugeridos: novo, em conversa, proposta enviada, ganho, perdido. Lembretes e resumo semanal devem consultar essa lista; **ainda não estão agendados**. Mensagens automáticas a clientes também não foram ativadas.

### Falhas e recuperação

O e-mail é enviado primeiro. Se ele falhar, a API não declara sucesso nem encaminha o pedido. Se o webhook falhar ou demorar mais de quatro segundos, a resposta continua sendo sucesso, pois o e-mail foi aceito. O log contém somente o ID para recuperar o contato na caixa de entrada. **Não há fila durável nem retry automático nesta etapa**: reconciliar a caixa de entrada com o CRM pelo ID. A mesma pessoa pode reenviar o formulário e gerar outro ID. Para entrega garantida com retry e deduplicação entre reenvios, a próxima etapa exige armazenamento durável/outbox.

## 3. Search Console e rotina comercial

O Search Console permanece separado do Analytics. Para automatizar seu relatório, será necessário autorizar leitura da propriedade e escolher onde executar a rotina. Nenhuma credencial Google foi adicionada.

Acompanhar semanalmente: consultas e páginas com impressões/cliques no Search Console; pedidos por serviço e origem no CRM; propostas enviadas e contratos ganhos. Priorizar ajustes nas páginas que recebem buscas relevantes mas não geram contatos. Não inferir vendas a partir de visitas ou cliques. Conteúdo novo deve responder dúvidas reais de contratação e passar por revisão antes de publicar.

## Validação e ativação

- `npm run validate` verifica lint, tipos, testes unitários e build.
- Testes de medição: `npm run build:check` já compila com `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST123` (só no build de validação, nunca no deploy). Depois, `npm run test:e2e` roda tudo, inclusive `tests/e2e/analytics.spec.ts`. A tag é simulada nos testes; nenhum dado é enviado ao Google.
- Conferir no navegador: rejeitar → nenhuma tag; aceitar → uma visita por navegação; erro de formulário → nenhum lead; sucesso → um lead; WhatsApp → clique somente; desativar → nenhuma nova coleta.
- Testar o webhook em homologação, inclusive erro/timeout, antes de configurar em produção.
- Nunca usar `EMAIL_PROVIDER=test` em produção. Não publicar o ID fictício usado nos testes.

Referências: [GA4: visualizações manuais e histórico](https://developers.google.com/analytics/devguides/collection/ga4/views), [Google tag API](https://developers.google.com/tag-platform/gtagjs/reference), [evento generate_lead](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead).
