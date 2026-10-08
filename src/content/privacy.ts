import type { Locale } from "@/i18n/config";

export type PrivacySection = { title: string; paragraphs: string[] };

/**
 * Política alinhada ao comportamento real do site: formulário enviado por e-mail,
 * limitação de requisições por hash de IP, pagamentos pelo Stripe e preferência de tema no navegador.
 * Inclui analytics opcional com consentimento e integração opcional dos pedidos.
 * Atualize este texto quando esse comportamento mudar.
 */
export const privacyPolicy: Record<Locale, PrivacySection[]> = {
  "pt-BR": [
    {
      title: "Quem é o responsável",
      paragraphs: [
        "Este site é mantido por Renan Augusto dos Santos, responsável pelo tratamento dos dados descritos aqui. Para qualquer assunto de privacidade, escreva para contato@renanaugusto.com.br.",
      ],
    },
    {
      title: "Dados enviados pelo formulário de contato",
      paragraphs: [
        "Quando você usa o formulário, coletamos nome, e-mail, serviço de interesse e a descrição da sua necessidade. Empresa, telefone, faixa de orçamento e prazo desejado são opcionais.",
        "Na pré-contratação de um pacote (página Contratar), coletamos nome completo, e-mail, WhatsApp e a descrição do projeto, junto com o pacote escolhido, para enviar a proposta ou o link de pagamento.",
        "Esses dados são usados apenas para responder ao seu contato e, se for o caso, preparar uma proposta. Não são usados para campanhas de marketing nem vendidos. Provedores contratados de e-mail e, quando configurada, de gestão de pedidos processam os dados para atender sua solicitação.",
      ],
    },
    {
      title: "Como os dados são processados",
      paragraphs: [
        "O site não guarda as mensagens em banco de dados. O conteúdo do formulário é repassado a um provedor de envio de e-mail contratado para essa finalidade e entregue na caixa de entrada do responsável, onde fica pelo tempo necessário para a conversa. Quando a integração de gestão de pedidos está habilitada, uma cópia é encaminhada ao sistema contratado para organizar o atendimento e acompanhar a proposta. O site não mantém um banco próprio de contatos.",
        "Os pagamentos são feitos na página segura do Stripe (cartão, Pix ou boleto). Os dados do cartão são digitados diretamente no Stripe e nunca passam pelo site. O Stripe recebe o número do pedido, o nome, o e-mail, o WhatsApp e a descrição do projeto, para identificar a cobrança, e guarda o registro do pagamento conforme a política de privacidade dele. O site guarda apenas o status do pedido (pago ou pendente).",
        "Para evitar abuso, o servidor limita o número de envios por origem. O endereço IP é transformado em um código irreversível (hash) e mantido por até 10 minutos apenas para essa contagem. A hospedagem do site pode registrar dados técnicos de acesso, como IP e navegador, em seus próprios registros de segurança.",
      ],
    },
    {
      title: "Armazenamento no navegador",
      paragraphs: [
        "O site guarda sua preferência de tema, o resumo do pedido durante uma contratação (até a confirmação) e, quando a medição está disponível, sua escolha sobre estatísticas no armazenamento local. Se você permitir, o Google Analytics usa cookies para medir páginas visitadas e interações com o formulário, os botões de contato e as etapas da contratação. Não enviamos os campos do formulário nem dados de pagamento ao Analytics. Não habilitamos recursos de publicidade. Você pode desativar as estatísticas pelo controle no rodapé; isso interrompe a coleta futura, sem apagar automaticamente dados já processados pelo Google.",
      ],
    },
    {
      title: "Contato pelo WhatsApp",
      paragraphs: [
        "Com sua permissão para estatísticas, guardamos durante a sessão a página de entrada, o domínio de referência e identificadores de campanha (UTM). Essas informações também acompanham o formulário para identificar a origem do pedido. Sem essa permissão, não guardamos essa atribuição nem carregamos o Analytics.",
        "O botão de WhatsApp apenas abre uma conversa com uma mensagem pronta, que você pode editar antes de enviar. Se as estatísticas estiverem permitidas, registramos apenas o clique, sem enviar ao Analytics o número ou a mensagem pronta. O clique não confirma o envio de mensagem; a conversa acontece no WhatsApp e segue a política de privacidade do próprio aplicativo.",
      ],
    },
    {
      title: "Seus direitos",
      paragraphs: [
        "Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção ou exclusão dos dados enviados, entre outros direitos. Basta escrever para contato@renanaugusto.com.br.",
      ],
    },
  ],
  en: [
    {
      title: "Who is responsible",
      paragraphs: [
        "This website is maintained by Renan Augusto dos Santos, who is responsible for the processing described here. For any privacy matter, write to contato@renanaugusto.com.br.",
      ],
    },
    {
      title: "Data sent through the contact form",
      paragraphs: [
        "When you use the form, we collect your name, email, service of interest and a description of your needs. Company, phone, budget range and desired timeline are optional.",
        "When you request a package (Hire page), we collect your full name, email, WhatsApp number and project description, along with the chosen package, to send you the proposal or payment link.",
        "This data is used only to reply to your message and, when applicable, to prepare a proposal. It is not used for marketing campaigns or sold. Contracted email providers and, when configured, enquiry management providers process the data to handle your request.",
      ],
    },
    {
      title: "How the data is processed",
      paragraphs: [
        "The website does not store messages in a database. The form content is passed to an email delivery provider engaged for this purpose and delivered to the owner's inbox, where it remains for as long as the conversation requires. When the enquiry management integration is enabled, a copy is forwarded to the contracted system to organize follow-up and proposals. The site does not maintain its own contact database.",
        "Payments happen on Stripe's secure page (card, Pix or boleto). Card details are typed directly into Stripe and never pass through this website. Stripe receives the order number, name, email, WhatsApp number and project description to identify the charge, and keeps the payment record under its own privacy policy. The website stores only the order status (paid or pending).",
        "To prevent abuse, the server limits the number of submissions per origin. The IP address is turned into an irreversible code (hash) and kept for up to 10 minutes only for this count. The hosting provider may record technical access data, such as IP and browser, in its own security logs.",
      ],
    },
    {
      title: "Browser storage",
      paragraphs: [
        "The website stores your theme preference, the order summary during a hiring flow (until it is confirmed) and, when measurement is available, your analytics choice locally. If you allow it, Google Analytics uses cookies to measure page visits and interactions with the form, the contact buttons and the hiring steps. Form fields and payment data are not sent to Analytics. Advertising features are disabled. You can disable analytics using the footer control; this stops future collection without automatically deleting data already processed by Google.",
      ],
    },
    {
      title: "Contact via WhatsApp",
      paragraphs: [
        "With your analytics permission, we store the landing page, referring domain and campaign identifiers (UTM) for the session. These details also accompany the contact form to identify the enquiry source. Without this permission, we do not store attribution or load Analytics.",
        "The WhatsApp button only opens a chat with a prefilled message, which you can edit before sending. If analytics is allowed, only the click is measured, without sending the phone number or prefilled message to Analytics. A click does not confirm that a message was sent; the conversation happens on WhatsApp and follows the app's own privacy policy.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: [
        "Under Brazil's General Data Protection Law (LGPD), you can request access to, correction of or deletion of the data you sent, among other rights. Just write to contato@renanaugusto.com.br.",
      ],
    },
  ],
};
