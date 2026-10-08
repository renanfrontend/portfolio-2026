// Roteiro do vídeo de demonstração do checkout (modo de teste), narrado em primeira pessoa pelo Renan.
// `text` vira legenda (e é o que o Renan lê na gravação da própria voz).
// `say` só é usado na voz sintética de reserva (prepare-audio.mjs), para acertar a pronúncia.
// Cada cena do record.mjs dura, no mínimo, o tempo da sua fala.

const say = {
  site: "renan augusto ponto com ponto bê érre",
  stripe: "Istráipi",
  whatsapp: "Uótsápi",
  frontend: "frônti ênd",
};

export const narration = [
  {
    id: "intro",
    text: "Quer que o seu cliente contrate e pague direto pelo seu site, sem ficar trocando mensagem e mandando boleto na mão? Deixa eu te mostrar.",
  },
  {
    id: "home",
    text: "Eu sou o Renan, desenvolvedor front-end, e esse é o fluxo de contratação que eu construí no meu próprio site.",
    say: `Eu sou o Renan, desenvolvedor ${say.frontend}, e esse é o fluxo de contratação que eu construí no meu próprio site.`,
  },
  {
    id: "pacotes",
    text: "O cliente vê cada pacote com o que está incluso, o prazo e o preço. Tudo claro, sem precisar pedir orçamento.",
  },
  {
    id: "modal",
    text: "Escolheu? Na mesma tela ele confere o resumo e o valor.",
  },
  {
    id: "validacao",
    text: "Os dados são preenchidos em segundos, com validação e WhatsApp já formatado. Nada de contato errado.",
    say: `Os dados são preenchidos em segundos, com validação e ${say.whatsapp} já formatado. Nada de contato errado.`,
  },
  {
    id: "servidor",
    text: "Ao avançar, o sistema confere tudo e abre o pagamento seguro, com o preço protegido contra alteração.",
  },
  {
    id: "checkout",
    text: "Seu cliente paga como preferir: Pix, boleto ou cartão. Aqui estou no modo de teste, então nenhuma cobrança é real.",
  },
  {
    id: "cartao",
    text: "E os dados do cartão ficam com o Stripe, nunca passam pelo site.",
    say: `E os dados do cartão ficam com o ${say.stripe}, nunca passam pelo site.`,
  },
  {
    id: "sucesso",
    text: "Pagamento aprovado! O cliente recebe a confirmação na hora, com o número do pedido e o próximo passo.",
  },
  {
    id: "bastidores",
    text: "Nos bastidores, o site recebe o aviso do pagamento, marca o pedido como pago e manda os e-mails, para o cliente e para mim. Sem planilha, sem conferir na mão.",
  },
  {
    id: "outro",
    text: "Tem uma empresa, um comércio ou presta serviço? Eu crio isso para o seu negócio. Fala comigo em renanaugusto.com.br.",
    say: `Tem uma empresa, um comércio ou presta serviço? Eu crio isso para o seu negócio. Fala comigo em ${say.site}.`,
  },
];

const escapeXml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** SSML aceito pelas vozes do Windows (voz sintética de reserva). */
export const toSsml = (item) =>
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">${escapeXml(item.say ?? item.text)}</speak>`;
