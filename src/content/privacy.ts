import type { Locale } from "@/i18n/config";

export type PrivacySection = { title: string; paragraphs: string[] };

/**
 * Política alinhada ao comportamento real do site: formulário enviado por e-mail,
 * limitação de requisições por hash de IP, pagamentos pelo Stripe, Google Analytics 4
 * e preferência de tema no navegador. Atualize este texto quando esse comportamento mudar.
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
        "Esses dados são usados apenas para responder ao seu contato e, se for o caso, preparar uma proposta. Não são usados para marketing nem vendidos ou cedidos a terceiros.",
      ],
    },
    {
      title: "Como os dados são processados",
      paragraphs: [
        "O site não guarda as mensagens em banco de dados. O conteúdo do formulário é repassado a um provedor de envio de e-mail contratado para essa finalidade e entregue na caixa de entrada do responsável, onde fica pelo tempo necessário para a conversa.",
        "Os pagamentos são feitos na página segura do Stripe (cartão, Pix ou boleto). Os dados do cartão são digitados diretamente no Stripe e nunca passam pelo site. O Stripe recebe o número do pedido, o nome, o e-mail, o WhatsApp e a descrição do projeto, para identificar a cobrança, e guarda o registro do pagamento conforme a política de privacidade dele. O site guarda apenas o status do pedido (pago ou pendente).",
        "Para evitar abuso, o servidor limita o número de envios por origem. O endereço IP é transformado em um código irreversível (hash) e mantido por até 10 minutos apenas para essa contagem. A hospedagem do site pode registrar dados técnicos de acesso, como IP e navegador, em seus próprios registros de segurança.",
      ],
    },
    {
      title: "Armazenamento no navegador",
      paragraphs: [
        "O site guarda a sua preferência de tema (escuro, claro ou do sistema) no armazenamento local do navegador e, durante uma contratação, o resumo do pedido até a confirmação.",
        "Para medir visitas e contratações de forma agregada, usamos o Google Analytics 4, que grava cookies próprios (como _ga) no seu navegador. Os sinais do Google para publicidade e a personalização de anúncios ficam desligados, e nenhum dado de pagamento é enviado ao Analytics. Você pode bloquear esses cookies nas configurações do navegador sem prejudicar o uso do site. Não usamos ferramentas de publicidade.",
      ],
    },
    {
      title: "Contato pelo WhatsApp",
      paragraphs: [
        "O botão de WhatsApp apenas abre uma conversa com uma mensagem pronta, que você pode editar antes de enviar. O site não envia nem guarda nenhum dado nesse caso; a conversa acontece no WhatsApp e segue a política de privacidade do próprio aplicativo.",
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
        "This data is used only to reply to your message and, when applicable, to prepare a proposal. It is not used for marketing and is not sold or shared with third parties.",
      ],
    },
    {
      title: "How the data is processed",
      paragraphs: [
        "The website does not store messages in a database. The form content is passed to an email delivery provider engaged for this purpose and delivered to the owner's inbox, where it remains for as long as the conversation requires.",
        "Payments happen on Stripe's secure page (card, Pix or boleto). Card details are typed directly into Stripe and never pass through this website. Stripe receives the order number, name, email, WhatsApp number and project description to identify the charge, and keeps the payment record under its own privacy policy. The website stores only the order status (paid or pending).",
        "To prevent abuse, the server limits the number of submissions per origin. The IP address is turned into an irreversible code (hash) and kept for up to 10 minutes only for this count. The hosting provider may record technical access data, such as IP and browser, in its own security logs.",
      ],
    },
    {
      title: "Browser storage",
      paragraphs: [
        "The website stores your theme preference (dark, light or system) in the browser's local storage and, during a hiring flow, the order summary until it is confirmed.",
        "To measure visits and hires in aggregate, we use Google Analytics 4, which sets its own cookies (such as _ga) in your browser. Google signals for advertising and ad personalization are turned off, and no payment data is sent to Analytics. You can block these cookies in your browser settings without affecting the website. We do not use advertising tools.",
      ],
    },
    {
      title: "Contact via WhatsApp",
      paragraphs: [
        "The WhatsApp button only opens a chat with a prefilled message, which you can edit before sending. The website does not send or store any data in this case; the conversation happens on WhatsApp and follows the app's own privacy policy.",
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
