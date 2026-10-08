import type { ServicePackage } from "@/features/packages/types";

/**
 * Pacotes de contratação exibidos em /contratar.
 *
 * Para atualizar preço, prazo ou disponibilidade, edite só este arquivo:
 * - price: valor em reais, ou null para mostrar "Sob consulta".
 * - status: "available", "limited" (agenda limitada) ou "unavailable" (desativa o botão).
 * - deadline: prazo estimado; sem ele, a página mostra "Combinado na proposta".
 * - installments: true mostra "ou parcelado no cartão" abaixo do preço.
 * - cta: "whatsapp" troca o botão por "Falar sobre o projeto" (abre o WhatsApp com whatsappMessage).
 *
 * Valores definidos em 07/10/2026 com base em referências de mercado (dev frontend sênior freelancer
 * no Brasil: R$ 220 a R$ 300/h; app/MVP: R$ 15 a 30 mil; manutenção mensal: R$ 500 a R$ 2.000),
 * posicionados na faixa de entrada do nível sênior. Diagnóstico ajustado para R$ 1.900 a pedido do
 * Renan (porta de entrada). Revisar periodicamente.
 */
export const servicePackages: ServicePackage[] = [
  {
    id: "diagnostico-tecnico",
    badge: "start-here",
    price: 1900,
    priceFrom: true,
    status: "available",
    installments: true,
    serviceSlug: "consultoria-frontend",
    copy: {
      "pt-BR": {
        name: "Diagnóstico Técnico",
        deadline: "5 a 7 dias úteis",
        description: "Uma análise objetiva do seu site ou aplicação para saber o que priorizar antes de investir.",
        deliverables: [
          "Reunião de entendimento do produto e dos objetivos",
          "Análise de código, performance e acessibilidade",
          "Relatório escrito com problemas priorizados",
          "Plano de ação com próximos passos e estimativas",
        ],
      },
      en: {
        name: "Technical Assessment",
        deadline: "5 to 7 business days",
        description: "An objective review of your website or app so you know what to prioritize before investing.",
        deliverables: [
          "Kickoff call to understand the product and goals",
          "Code, performance and accessibility review",
          "Written report with prioritized issues",
          "Action plan with next steps and estimates",
        ],
      },
    },
  },
  {
    id: "setup-mvp",
    badge: "popular",
    price: 12000,
    priceFrom: true,
    status: "available",
    // Escopo muito variável: em vez de contratar direto, abre uma conversa de alinhamento.
    cta: "whatsapp",
    serviceSlug: "desenvolvimento-web",
    copy: {
      "pt-BR": {
        name: "Setup / MVP",
        deadline: "4 a 8 semanas",
        whatsappMessage:
          "Olá, Renan! Vi o pacote *Setup / MVP* no seu site e quero conversar sobre um projeto. Meu nome é [seu nome], da empresa [empresa]. A ideia é: [descreva rapidamente]. Prazo desejado: [quando precisa].",
        description: "Do zero ao ar: a primeira versão do seu site, sistema ou produto com base sólida para crescer.",
        deliverables: [
          "Definição de escopo e protótipo das telas principais",
          "Desenvolvimento com Next.js ou React e TypeScript",
          "Layout responsivo, acessível e com SEO técnico",
          "Publicação, domínio configurado e documentação",
        ],
      },
      en: {
        name: "Setup / MVP",
        deadline: "4 to 8 weeks",
        whatsappMessage:
          "Hi Renan! I saw the *Setup / MVP* package on your website and would like to talk about a project. My name is [your name], from [company]. The idea is: [short description]. Desired timeline: [when you need it].",
        description: "From zero to live: the first version of your website, system or product on a solid base to grow.",
        deliverables: [
          "Scope definition and prototype of the main screens",
          "Development with Next.js or React and TypeScript",
          "Responsive, accessible layout with technical SEO",
          "Deployment, domain setup and documentation",
        ],
      },
    },
  },
  {
    id: "pacote-horas",
    price: 4400,
    status: "available",
    installments: true,
    serviceSlug: "consultoria-frontend",
    copy: {
      "pt-BR": {
        name: "Pacote de Horas de Consultoria",
        deadline: "20 horas para usar em até 60 dias",
        description: "Horas flexíveis para o seu time: revisão de código, arquitetura, mentoria ou implementação pontual.",
        deliverables: [
          "20 horas (R$ 220/h) para usar conforme a demanda",
          "Revisão de código e decisões de arquitetura",
          "Pareamento e mentoria com o time",
          "Relatório das horas utilizadas",
        ],
      },
      en: {
        name: "Consulting Hours Package",
        deadline: "20 hours to use within 60 days",
        description: "Flexible hours for your team: code review, architecture, mentoring or targeted implementation.",
        deliverables: [
          "20 hours (R$ 220/h) to use as needed",
          "Code review and architecture decisions",
          "Pairing and mentoring with the team",
          "Report of the hours used",
        ],
      },
    },
  },
  {
    id: "suporte-mensal",
    badge: "recurring",
    price: 1800,
    priceFrom: true,
    pricePeriod: "month",
    status: "available",
    serviceSlug: "desenvolvimento-web",
    copy: {
      "pt-BR": {
        name: "Suporte Mensal",
        deadline: "Ciclos mensais",
        description: "Acompanhamento contínuo para manter o site ou sistema atualizado, seguro e evoluindo.",
        deliverables: [
          "Correções e pequenas melhorias todo mês",
          "Atualização de dependências e monitoramento",
          "Canal direto para dúvidas e prioridades",
          "Reunião mensal de acompanhamento",
        ],
      },
      en: {
        name: "Monthly Support",
        deadline: "Monthly cycles",
        description: "Ongoing care to keep your website or system up to date, secure and evolving.",
        deliverables: [
          "Fixes and small improvements every month",
          "Dependency updates and monitoring",
          "Direct channel for questions and priorities",
          "Monthly follow-up meeting",
        ],
      },
    },
  },
];
