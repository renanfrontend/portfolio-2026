import type { Service } from "@/features/services/types";

const discovery = {
  title: "Conversa inicial",
  description: "Entendo o objetivo, o contexto e as restrições. Sem custo e sem compromisso.",
};

export const services: Service[] = [
  {
    id: "desenvolvimento-web",
    slug: "desenvolvimento-web",
    title: "Sites, aplicações web e dashboards",
    summary:
      "Sites institucionais, aplicações, portais e painéis de dados com React, Next.js e TypeScript, prontos para crescer.",
    problems: [
      "O site atual é lento, difícil de atualizar ou não funciona bem no celular.",
      "A operação depende de planilhas e falta um painel que mostre o que importa.",
      "É preciso um portal para clientes, parceiros ou equipes internas.",
      "A ideia está validada e precisa virar um produto web.",
    ],
    deliverables: [
      "Aplicação responsiva em Next.js ou React com TypeScript.",
      "Interface acessível, com navegação por teclado e bom contraste.",
      "SEO técnico e metadados para páginas públicas.",
      "Código versionado, documentado e com deploy configurado.",
    ],
    process: [
      discovery,
      { title: "Escopo e protótipo", description: "Definimos páginas, fluxos e prioridades antes de escrever código." },
      { title: "Desenvolvimento", description: "Entregas frequentes em um ambiente de homologação para acompanhar o progresso." },
      { title: "Publicação e passagem", description: "Deploy, documentação e orientação para manter ou evoluir o projeto." },
    ],
    faq: [
      {
        question: "Quanto custa e quanto tempo leva?",
        answer:
          "Depende do escopo. Depois da conversa inicial, envio uma proposta com o que será entregue, as etapas e o investimento.",
      },
      {
        question: "Vou conseguir atualizar o conteúdo sozinho?",
        answer:
          "Se for um requisito, isso entra no escopo: pode ser uma estrutura simples de editar ou a integração com um CMS.",
      },
      {
        question: "Você também cuida da hospedagem?",
        answer: "Posso configurar o deploy na plataforma que fizer mais sentido para o projeto e documentar como mantê-lo.",
      },
    ],
    ctaLabel: "Solicitar orçamento de desenvolvimento",
  },
  {
    id: "consultoria-frontend",
    slug: "consultoria-frontend",
    title: "Consultoria frontend",
    summary:
      "Arquitetura, performance, acessibilidade e modernização de aplicações React existentes, ao lado do seu time.",
    problems: [
      "A aplicação ficou lenta e ninguém sabe exatamente por quê.",
      "O código cresceu sem padrão e cada mudança quebra outra parte.",
      "Telas legadas precisam ser modernizadas sem parar a operação.",
      "O produto precisa atender a requisitos de acessibilidade.",
    ],
    deliverables: [
      "Diagnóstico escrito com problemas priorizados por impacto e esforço.",
      "Recomendações de arquitetura, organização de pastas e padrões de código.",
      "Plano de modernização incremental.",
      "Pareamento ou implementação das melhorias prioritárias, quando combinado.",
    ],
    process: [
      discovery,
      { title: "Diagnóstico", description: "Leitura do código, medições de performance e revisão de acessibilidade." },
      { title: "Plano", description: "Relatório com prioridades e caminhos possíveis, apresentado ao time." },
      { title: "Acompanhamento", description: "Apoio na execução, revisão de código ou implementação direta." },
    ],
    faq: [
      {
        question: "Preciso dar acesso ao código?",
        answer: "Sim, para um diagnóstico útil. O acesso pode ser restrito e sob acordo de confidencialidade.",
      },
      {
        question: "Você trabalha com Angular ou Vue?",
        answer: "O foco é React e Next.js, mas também tenho experiência com Angular e Vue para diagnósticos e migrações.",
      },
    ],
    ctaLabel: "Solicitar diagnóstico",
  },
  {
    id: "integracoes",
    slug: "integracoes",
    title: "Integrações de APIs e sistemas",
    summary:
      "Conexão entre frontends, APIs REST, autenticação e sistemas corporativos para os dados circularem sem retrabalho.",
    problems: [
      "Informações são copiadas à mão entre sistemas.",
      "O frontend precisa consumir APIs internas ou de terceiros com segurança.",
      "Falta um fluxo de login ou controle de acesso por perfil.",
    ],
    deliverables: [
      "Camada de integração tipada com tratamento de erros e estados de carregamento.",
      "Autenticação e controle de acesso conforme o sistema existente.",
      "Validação de dados na fronteira com serviços externos.",
      "Documentação dos contratos e das variáveis de ambiente.",
    ],
    process: [
      discovery,
      { title: "Mapeamento", description: "Levantamento dos sistemas, contratos de API e regras de acesso envolvidos." },
      { title: "Implementação", description: "Integração com testes e tratamento de falhas e indisponibilidade." },
      { title: "Entrega", description: "Publicação, monitoramento inicial e documentação." },
    ],
    faq: [
      {
        question: "Você desenvolve o backend também?",
        answer:
          "Meu foco é o frontend e a camada de integração. Rotas de servidor e adaptadores simples entram no escopo; backends maiores podem ser feitos em parceria.",
      },
    ],
    ctaLabel: "Conversar sobre uma integração",
  },
  {
    id: "automacao-ia",
    slug: "automacao-ia",
    title: "Automação com IA",
    summary:
      "Diagnóstico de tarefas repetitivas e criação de fluxos e assistentes com IA integrados aos sistemas da sua empresa.",
    problems: [
      "A equipe gasta horas em tarefas repetitivas, como cadastro, triagem ou resumo de documentos.",
      "Há interesse em IA, mas não está claro onde ela traz retorno.",
      "Informações estão espalhadas em documentos difíceis de consultar.",
    ],
    deliverables: [
      "Diagnóstico das tarefas com maior potencial de automação.",
      "Prova de conceito com uma interface para validar o fluxo com usuários reais.",
      "Integração com modelos de IA tratando a resposta como dado não confiável e validado.",
      "Orientações sobre custo, privacidade e limites do uso de IA no fluxo.",
    ],
    process: [
      discovery,
      { title: "Diagnóstico", description: "Mapeamos o processo atual e escolhemos um caso de uso com retorno claro." },
      { title: "Prova de conceito", description: "Um protótipo funcional para testar com dados e usuários reais." },
      { title: "Evolução", description: "Ajustes, integração aos sistemas e decisão sobre a próxima etapa." },
    ],
    faq: [
      {
        question: "Os dados da empresa ficam seguros?",
        answer:
          "Privacidade é definida no diagnóstico: quais dados podem ir para um provedor de IA, quais precisam ser anonimizados e quais não devem sair do ambiente.",
      },
      {
        question: "Que exemplos existem?",
        answer:
          "O VisionStock e o Gemini Beyond Prompts, na página de projetos, são demonstrações pessoais desse tipo de fluxo.",
      },
    ],
    ctaLabel: "Conversar sobre automação",
  },
];
