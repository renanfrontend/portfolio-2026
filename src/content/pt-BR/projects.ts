import type { ProjectCopy } from "@/features/projects/types";

export const projectsCopy: Record<string, ProjectCopy> = {
  "logiflow-3d": {
    title: "LogiFlow 3D",
    summary:
      "Centro de distribuição interativo em 3D para simular decisões operacionais, com indicadores e cenários comparáveis.",
    coverAlt: "Tela do LogiFlow 3D com indicadores de estoque e fluxo e a maquete isométrica do centro logístico.",
    galleryAlt: [],
    challenge:
      "Tabelas isoladas nem sempre mostram onde um gargalo acontece. A proposta foi ligar uma representação espacial de um centro logístico a indicadores e cenários que possam ser comparados, como pico de demanda e doca bloqueada.",
    solution:
      "Cena isométrica procedural em React Three Fiber com armazéns, docas, caminhões e empilhadeiras selecionáveis, acompanhamento de cargas em cinco etapas e indicadores derivados das mesmas funções de domínio. As regras ficam em camadas inspiradas em Clean Architecture, sem dependência de React.",
    contribution:
      "Projeto individual de portfólio: concepção, modelagem do domínio, interface, cena 3D, testes e publicação. É uma prova de conceito visual, sem conexão com instalações reais.",
    outcomes: [
      "Demonstração publicada no GitHub Pages com pipeline de CI.",
      "Atalhos de teclado, seleção de setores por botões HTML acessíveis e preferência de movimento reduzido.",
      "Fallback para quando o navegador não oferece WebGL.",
    ],
  },
  "visionstock-ai": {
    title: "VisionStock",
    summary:
      "Prova de conceito de catálogo para e-commerce: da foto do produto ao cadastro preenchido por IA, estoque endereçado em 3D, vitrine e relatórios XML.",
    coverAlt: "Tela de cadastro do VisionStock com área para enviar foto ou vídeo do produto e formulário preenchido pela IA.",
    galleryAlt: [],
    challenge:
      "Cadastrar produtos é repetitivo: título, descrição, categoria, atributos, estoque e publicação em canais diferentes. O objetivo foi reduzir esse trabalho manual sem perder o controle humano sobre o que é publicado.",
    solution:
      "Um modelo de visão preenche o cadastro a partir de foto ou de um vídeo curto, cujos quadros são extraídos no navegador. O fluxo segue para um armazém 3D com arrastar e soltar, um quadro de publicação com requisitos por etapa e exportações em XML, CSV e JSON. A saída do modelo é tratada como entrada não confiável e validada com Zod.",
    contribution:
      "Projeto individual: arquitetura em camadas (domínio, casos de uso, infraestrutura), integração com provedores de visão por meio de uma porta substituível, interface, testes do domínio e deploy.",
    outcomes: [
      "Demonstração publicada na Vercel.",
      "Regras de negócio testadas sem renderizar a interface.",
      "Provedor de IA intercambiável (Gemini ou Anthropic) atrás de uma mesma interface.",
    ],
  },
  "gemini-beyond-prompts": {
    title: "Gemini Beyond Prompts",
    summary:
      "Protótipo de painel de IA que reúne chat com o Google Gemini e telas de análise de documentos (RAG) e de agentes em uma única interface.",
    coverAlt: "Tela inicial do Gemini Beyond Prompts com os módulos de chat, análise de documentos e assistente.",
    galleryAlt: [],
    challenge:
      "Explorar como recursos de IA generativa vão além de um campo de prompt: conversa com contexto, busca semântica em documentos próprios e tarefas executadas por agentes.",
    solution:
      "Aplicação em React, Vite e TypeScript com três módulos: chat com o Google Gemini, que mantém o contexto da conversa; uma biblioteca de documentos no estilo RAG; e um assistente com agentes de pesquisa, planejamento e execução inspirados no LangGraph. O chat chama a API de verdade; a análise de documentos e os agentes são protótipos de interface com processamento simulado, e o banco da versão completa (Supabase com pgvector) já está modelado.",
    contribution: "Projeto individual de estudo: interface, integração com a API do Gemini e organização dos módulos.",
    outcomes: [
      "Demonstração publicada na Vercel.",
      "Chat funcional com a API do Gemini, usando a chave do próprio visitante.",
      "Banco modelado no Supabase com pgvector para a próxima etapa: a busca semântica.",
    ],
  },
  "fnaf-web": {
    title: "Five Nights at Freddy's Web",
    summary:
      "Remaster no navegador de um projeto de fã do clássico de terror, com motor de jogo novo, testes automatizados e deploy contínuo.",
    coverAlt: "Menu do Five Nights at Freddy's Web com Freddy, Bonnie, Chica e Foxy e o botão Começar.",
    galleryAlt: [],
    challenge:
      "O projeto de fã original (Wendell de Sousa, 2021) não rodava mais com o Node atual e tinha falhas de estado: timers que nunca eram limpos, animatrônicos que ignoravam o que acontecia e telas que não atualizavam.",
    solution:
      "Migração para Vite 6 e React 18 e um motor de jogo novo baseado em ticks, sem setTimeout, no lugar dos reducers do Redux e dos timers soltos: ele pode ser pausado, reiniciado e testado de forma determinística. O comportamento ficou mais fiel ao original: rotas aleatórias, dificuldade crescente, blecaute em três fases.",
    contribution:
      "Remaster individual: diagnóstico e correção dos bugs, reescrita do motor, 20 testes automatizados com Vitest, acessibilidade (teclado, aria-label, movimento reduzido) e deploy automático no GitHub Pages. Five Nights at Freddy's © Scott Cawthon; projeto de fã, sem fins lucrativos.",
    outcomes: [
      "Jogo publicado no GitHub Pages, com deploy a cada push.",
      "Motor testável com 20 testes automatizados.",
      "Pausa automática ao trocar de aba, progresso salvo e atalhos de teclado.",
    ],
  },
  "upbeats-karaoke-player": {
    title: "UP! BEATS Karaokê",
    summary:
      "Karaokê que roda no navegador: letra sincronizada, remoção da voz original em tempo real e microfone com eco, tudo processado no próprio aparelho.",
    coverAlt: "Modo karaokê do UP! BEATS com a voz original removida, os controles de voz e de microfone, o visualizador de áudio e a letra sincronizada preenchendo a linha cantada.",
    galleryAlt: [],
    challenge:
      "Fazer karaokê de verdade sem servidor de áudio: tirar a voz de músicas comuns, mostrar a letra no tempo certo e deixar a pessoa ouvir a própria voz junto, sem atraso nem microfonia, em qualquer navegador.",
    solution:
      "Um único grafo da Web Audio API mistura música e microfone. A voz sai pela diferença entre os canais esquerdo e direito, e grave e brilho voltam por filtros em cascata fora da faixa vocal, com controle contínuo entre Original, Guia e Karaokê. As letras vêm sincronizadas do LRCLIB e podem ser calibradas tocando na linha cantada, com o ajuste salvo por música. O microfone tem compressor, eco e dois modos: caixas de som (com cancelamento de eco) e fones.",
    contribution:
      "Projeto pessoal: motor de áudio, integração com as APIs do iTunes (busca e prévias) e do LRCLIB (letras), calibração da letra, reprodução de arquivos do próprio aparelho, interface em três idiomas e deploy automático no GitHub Pages.",
    outcomes: [
      "Publicado no GitHub Pages, com deploy a cada push.",
      "Remoção de voz e microfone processados no navegador, sem servidor.",
      "Interface em português, inglês e espanhol.",
    ],
  },
  "mwm-portal": {
    title: "MWM Portal",
    summary:
      "Frontend de sistemas corporativos e logísticos: dashboards de operação, gestão de portaria e dados de cooperados.",
    galleryAlt: [],
    challenge:
      "Centralizar dados operacionais e de logística em interfaces que funcionassem bem no dia a dia, modernizando telas legadas e automatizando a entrega das aplicações.",
    solution:
      "SPAs e PWAs em React, TypeScript e Vite, com dashboards de logística e qualidade, migração de interfaces legadas para Tailwind CSS e Shadcn/UI e integração com APIs REST em Java Spring Boot.",
    contribution:
      "Atuei como Senior Frontend Engineer (set/2025 a set/2026) em um time: desenvolvimento das interfaces, modernização do legado e automação de build e deploy com Docker, Azure Container Apps e pipelines no Azure DevOps.",
    outcomes: [
      "Gestão de portaria, cooperados e dados operacionais centralizada em dashboards.",
      "Interfaces legadas modernizadas, com mais responsividade e acessibilidade.",
      "Build e deploy automatizados no Azure DevOps.",
    ],
  },
  "manor-escape": {
    title: "Manor Escape",
    summary:
      "Escape room vitoriano jogável no navegador, com quatro enigmas encadeados e um cofre interativo em 3D.",
    coverAlt: "Enigma do relógio de pêndulo no Manor Escape, com o mostrador em algarismos romanos, o ajuste de horas e minutos e o botão de dica.",
    galleryAlt: [],
    challenge:
      "Modelar um jogo com fluxo não linear, temporizador, dicas e progresso salvo sem espalhar regras pela interface.",
    solution:
      "Fluxo do jogo em uma máquina de estados XState, estado de interface em Zustand com persistência, cofre 3D em React Three Fiber e enigmas validados por funções puras, tudo organizado em Clean Architecture.",
    contribution: "Projeto individual de estudo: arquitetura, interface, cena 3D, testes unitários e um walkthrough E2E completo com Playwright.",
    outcomes: ["Jogo publicado no GitHub Pages.", "Recarregar a página não apaga o progresso da partida."],
  },
  "escudo-cidadao": {
    title: "Escudo Cidadão",
    summary: "Aplicação B2C de cibersegurança para ajudar o cidadão a se proteger de fraudes digitais.",
    coverAlt: "Painel do Escudo Cidadão com score de segurança e verificação de links em tema escuro.",
    galleryAlt: [],
    challenge: "Tornar recursos de proteção contra golpes, como a verificação de links suspeitos, acessíveis a quem não é técnico.",
    solution:
      "Interface em React, TypeScript e Material UI com painel de score de segurança, verificação de links e monitoramento, consumindo uma API Node.js e Express dedicada.",
    contribution: "Projeto individual: frontend completo, API em Node.js e publicação no Netlify (frontend) e no Render (API).",
    outcomes: ["Aplicação publicada e acessível.", "Configuração por ambiente para alternar entre a API local e a de produção."],
  },
  "aster-ct": {
    title: "Aster Centro Terapêutico",
    summary: "Site institucional para uma clínica terapêutica, com blog, contato e cuidados de SEO e LGPD.",
    coverAlt: "Página inicial do site do Aster Centro Terapêutico.",
    galleryAlt: [],
    challenge: "Apresentar a clínica e os seus serviços de forma acolhedora e facilitar o contato de pacientes e familiares.",
    solution:
      "Landing page responsiva com tema claro e escuro, galeria da estrutura, blog com páginas de artigo e compartilhamento, formulário de contato, banner de consentimento de cookies, sitemap e metadados Open Graph.",
    contribution: "Desenvolvimento do site completo, do layout à publicação.",
    outcomes: ["Site publicado no GitHub Pages.", "Sitemap, robots e Open Graph configurados para busca e compartilhamento."],
  },
  "helios-lab": {
    title: "HELIOS Lab",
    summary:
      "Protótipo jogável de suspense e terror em câmera fixa, em que os puzzles são sistemas físicos reais simulados no navegador.",
    coverAlt: "Cartão do repositório HELIOS Lab no GitHub.",
    galleryAlt: [],
    challenge:
      "Criar puzzles que dependem de física de verdade, como um pêndulo duplo caótico e convecção de fluidos, sem engine de jogo e rodando bem no navegador.",
    solution:
      "Vite e TypeScript estrito sem dependências de execução: renderer próprio em Canvas 2D pseudo-3D, áudio 100% procedural com Web Audio e integradores numéricos (Runge-Kutta 4) isolados em uma camada de domínio pura, também usada em scripts de calibragem.",
    contribution:
      "Projeto individual de estudo: arquitetura em camadas, simulações físicas, renderer, áudio e scripts de playtest automatizados. O build final é um único arquivo HTML.",
    outcomes: ["Três sistemas físicos jogáveis: pêndulo duplo, centrífuga e placa de Galton.", "Domínio de física testável sem DOM nem Canvas."],
  },
  gascontrol: {
    title: "GasControl",
    summary: "Interface para gestão de consumo de gás em condomínios, com KPIs, gráficos, gasômetros e alertas.",
    coverAlt: "Dashboard do GasControl com indicadores de gasômetros, leituras e alertas e um gráfico de consumo.",
    galleryAlt: [],
    challenge: "Dar visibilidade ao consumo de gás e aos alertas de cada condomínio em uma interface simples de operar.",
    solution:
      "Dashboard em React e TypeScript com KPIs, gráfico de consumo diário, telas de gasômetros e alertas, rotas protegidas, menu lateral retrátil e tema claro, escuro ou do sistema.",
    contribution:
      "Projeto individual de frontend. Funciona com uma API simulada; a integração com o backend e os testes E2E são os próximos passos.",
    outcomes: ["Interface completa para todos os fluxos previstos, operando com dados simulados."],
  },
};
