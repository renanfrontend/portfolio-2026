// Roteiro do vídeo de demonstração do checkout (modo de teste).
// `text` vira legenda; `say` é o que a voz lê (pronúncia das palavras em inglês e do domínio).
// Cada cena do record.mjs dura, no mínimo, o tempo da sua narração.

const say = {
  site: "renan augusto ponto com ponto bê érre",
  next: "Nékst jêi ésse",
  react: "Riéct",
  ts: "Táipi iscrípti",
  stripe: "Istráipi",
  whatsapp: "Uótsápi",
  webhook: "uébi rúqui",
  kickoff: "quíqui ófi",
};

export const narration = [
  {
    id: "intro",
    text: "Veja como funciona a contratação no site do Renan, do primeiro clique ao pagamento confirmado.",
  },
  {
    id: "home",
    text: "O site foi construído com Next.js, React e TypeScript, com animações próprias e foco em acessibilidade.",
    say: `O site foi construído com ${say.next}, ${say.react} e ${say.ts}, com animações próprias e foco em acessibilidade.`,
  },
  {
    id: "pacotes",
    text: "Na página de contratação, cada pacote mostra o que está incluso, o prazo e o preço, tudo a partir de um único arquivo de configuração.",
  },
  {
    id: "modal",
    text: "Ao clicar em Contratar Serviço, um modal mostra o resumo do pacote e o valor.",
  },
  {
    id: "validacao",
    text: "Os campos são validados antes de avançar, e o WhatsApp ganha máscara brasileira enquanto é digitado.",
    say: `Os campos são validados antes de avançar, e o ${say.whatsapp} ganha máscara brasileira enquanto é digitado.`,
  },
  {
    id: "servidor",
    text: "O servidor valida tudo de novo, calcula o preço sem confiar no navegador e cria uma sessão segura de pagamento no Stripe.",
    say: `O servidor valida tudo de novo, calcula o preço sem confiar no navegador e cria uma sessão segura de pagamento no ${say.stripe}.`,
  },
  {
    id: "checkout",
    text: "O cliente pode pagar com Pix, boleto ou cartão. Aqui, no modo de teste, usamos o cartão de testes do Stripe.",
    say: `O cliente pode pagar com Pix, boleto ou cartão. Aqui, no modo de teste, usamos o cartão de testes do ${say.stripe}.`,
  },
  {
    id: "cartao",
    text: "Os dados do cartão ficam só com o Stripe e nunca passam pelo site.",
    say: `Os dados do cartão ficam só com o ${say.stripe} e nunca passam pelo site.`,
  },
  {
    id: "sucesso",
    text: "Pagamento aprovado! O cliente volta ao site com o número do pedido e os próximos passos, incluindo o agendamento do kickoff.",
    say: `Pagamento aprovado! O cliente volta ao site com o número do pedido e os próximos passos, incluindo o agendamento do ${say.kickoff}.`,
  },
  {
    id: "bastidores",
    text: "Nos bastidores, o Stripe avisa o site por um webhook com assinatura verificada, que marca o pedido como pago e envia os e-mails de confirmação.",
    say: `Nos bastidores, o ${say.stripe} avisa o site por um ${say.webhook} com assinatura verificada, que marca o pedido como pago e envia os e-mails de confirmação.`,
  },
  {
    id: "outro",
    text: "Precisa de um fluxo como este no seu projeto? Fale com o Renan em renanaugusto.com.br.",
    say: `Precisa de um fluxo como este no seu projeto? Fale com o Renan em ${say.site}.`,
  },
];

const escapeXml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** SSML aceito pelas vozes do Windows. */
export const toSsml = (item) =>
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">${escapeXml(item.say ?? item.text)}</speak>`;
