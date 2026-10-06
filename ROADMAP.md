# Roadmap — Portfólio e Consultoria em Tecnologia

**Responsável:** Renan Augusto dos Santos  
**Uso:** especificação de implementação para Claude Code  
**Data:** 06/10/2026  
**Status:** MVP publicado em https://renan-augusto-dev.vercel.app (06/10/2026). Pendentes: credenciais de e-mail do formulário e domínio próprio.

## 1. Missão para o Claude Code

Construir um site profissional de portfólio e consultoria com React, Next.js, TypeScript e Tailwind CSS. O site deve apresentar o trabalho de Renan, facilitar a avaliação por recrutadores e gerar oportunidades de desenvolvimento, consultoria e automação com IA.

Leia este documento inteiro antes de alterar o projeto. Inspecione o repositório e as instruções locais existentes. Depois, implemente as etapas em ordem, valide os resultados e atualize os checkboxes deste arquivo com evidências reais.

Não encerre o trabalho apenas com outro plano: avance na implementação disponível. Se uma credencial ou conteúdo externo estiver ausente, conclua as partes independentes, registre o bloqueio e informe exatamente o que falta. Não declare integração, teste ou publicação como concluídos sem executá-los.

### Regras de execução

- Preserve alterações existentes do usuário; confira o estado do Git antes de editar.
- Se houver um projeto existente, adapte esta arquitetura ao contexto em vez de recriar tudo.
- Use o gerenciador indicado pelo lockfile. Em projeto novo, adote npm e mantenha apenas um lockfile.
- Verifique versões estáveis e compatibilidade na documentação oficial antes de instalar dependências; registre as versões efetivamente usadas.
- Faça escolhas rotineiras autonomamente e registre decisões relevantes em `docs/decisions.md`.
- Não invente clientes, depoimentos, resultados, certificações, links, imagens de aplicações ou métricas profissionais.
- Não exponha informações confidenciais de trabalhos anteriores. Use apenas material autorizado para portfólio.
- Não solicite segredos no chat: documente variáveis e utilize o mecanismo de ambiente disponível.
- Não adicione serviços pagos, rastreamento, publicação externa ou envio real de mensagens apenas para demonstrar funcionamento.
- Preparar o deploy faz parte deste roadmap. Publicar exige destino definido e autorização no contexto da execução; se já existirem, prossiga sem repetir a pergunta.
- Não inclua chatbot, CMS, autenticação, banco de dados ou painel administrativo no MVP sem necessidade explícita.
- Se commits forem solicitados ou fizerem parte do fluxo autorizado, use Conventional Commits e não inclua arquivos alheios à tarefa.

## 2. Contexto e posicionamento

Renan atua com desenvolvimento frontend, especialmente React, Next.js, TypeScript, interfaces corporativas, dashboards e integrações. Sua experiência anterior em logística e processos de negócio pode diferenciar a abordagem de consultoria.

Apresente automação com IA como uma frente de serviços e demonstrações. Não transforme uma oferta planejada em histórico de projetos entregues.

### Públicos e conversões

| Público | Necessidade | Ação principal |
| --- | --- | --- |
| Recrutadores | Entender competências e contribuições técnicas | Ver projetos, currículo e canais profissionais |
| Empresas | Avaliar capacidade de resolver um problema | Conhecer serviços e solicitar orçamento |
| Parceiros | Encontrar apoio técnico especializado | Entrar em contato |

### Serviços iniciais

1. Desenvolvimento de sites, aplicações web, dashboards e portais.
2. Consultoria frontend: arquitetura, performance, acessibilidade e modernização.
3. Integrações entre APIs, autenticação e sistemas corporativos.
4. Automação com IA: diagnóstico de tarefas repetitivas, fluxos e assistentes integrados.

## 3. Escopo funcional do MVP

| Rota | Conteúdo |
| --- | --- |
| `/pt-BR` e `/en` | Início com apresentação, competências, serviços, projetos e CTA |
| `/[locale]/sobre` | Trajetória, competências e currículo quando disponível |
| `/[locale]/projetos` | Projetos com busca e filtros |
| `/[locale]/projetos/[slug]` | Estudo de caso individual |
| `/[locale]/servicos` | Listagem de serviços |
| `/[locale]/servicos/[slug]` | Escopo, entregáveis, processo e perguntas frequentes |
| `/[locale]/contato` | Formulário e canais profissionais |
| `/[locale]/privacidade` | Informações compatíveis com os dados realmente tratados |
| `/api/contact` | Endpoint de contato no servidor |

Os segmentos `sobre`, `projetos`, `servicos`, `contato` e `privacidade` permanecem iguais nos dois idiomas no MVP. Os textos da interface serão traduzidos. Slugs de projetos e serviços serão estáveis entre os idiomas.

O acesso a `/` deve redirecionar para `/pt-BR`. A escolha explícita de idioma será preservada pela URL durante a navegação.

## 4. Direção visual

- Identidade: profissional, tecnológica, elegante e legível.
- Tema inicial: escuro; permitir claro e preferência do sistema.
- Paleta proposta: fundos grafite, texto de alto contraste e uma cor de destaque azul ou ciano.
- Tipografia: poucas famílias, boa hierarquia e corpo confortável no celular.
- Layout: espaços generosos, projetos com imagens reais e chamadas de ação claras.
- Header com navegação responsiva e acesso ao contato.
- Home com dois caminhos evidentes: explorar projetos e conversar sobre um projeto.
- Animações sutis; respeitar `prefers-reduced-motion`.
- Efeitos visuais não podem impedir leitura, navegação ou interação. Não adicionar 3D pesado ao MVP.
- Evitar carrosséis automáticos, excesso de efeitos e números decorativos sem evidência.
- Verificar telas de 360, 768, 1024 e 1440 px, sem rolagem horizontal indevida.

## 5. Arquitetura técnica

### Decisões de base

- Next.js com App Router e TypeScript em modo estrito.
- Tailwind CSS com tokens de design centralizados no CSS; usar configuração compatível com a versão instalada.
- Server Components para conteúdo, composição de páginas e leitura de dados.
- Client Components apenas para interatividade, APIs do navegador e estado local.
- Conteúdo editorial em módulos TypeScript, versionado no Git, sem CMS no MVP.
- Context API para tema. Consentimento e modal compartilhado somente se forem necessários.
- Zod como opção para validar o contrato de contato no cliente e no servidor; validação no servidor é obrigatória.
- React Hook Form é opcional; não instalar se o formulário simples puder ser implementado com clareza usando React.
- Não adicionar Redux, Zustand ou TanStack Query sem uma necessidade demonstrada.
- Componentes interativos complexos, como dialogs, devem usar uma base acessível já consolidada ou ser evitados no MVP.
- Integrações de e-mail e proteção contra abuso ficam atrás de módulos exclusivos do servidor.

### Estrutura de referência

Criar os arquivos quando a etapa correspondente for implementada. Não preencher o projeto com componentes vazios apenas para reproduzir esta lista.

```text
renan-portfolio/
  public/
    images/
      profile/
      projects/
      services/
    documents/
    icons/
  src/
    app/
      [locale]/
        layout.tsx
        not-found.tsx
        (site)/
          layout.tsx
          page.tsx
          error.tsx
          sobre/page.tsx
          projetos/
            page.tsx
            loading.tsx
            [slug]/page.tsx
          servicos/
            page.tsx
            [slug]/page.tsx
          contato/page.tsx
          privacidade/page.tsx
      api/contact/route.ts
      favicon.ico
      robots.ts
      sitemap.ts
    components/
      ui/
        button.tsx
        input.tsx
        textarea.tsx
        select.tsx
        checkbox.tsx
        badge.tsx
        card.tsx
        accordion.tsx
        skeleton.tsx
      layout/
        site-header.tsx
        desktop-nav.tsx
        mobile-nav.tsx
        site-footer.tsx
        container.tsx
        section.tsx
      shared/
        section-heading.tsx
        theme-toggle.tsx
        language-switcher.tsx
        social-links.tsx
        whatsapp-link.tsx
        breadcrumbs.tsx
        empty-state.tsx
        error-state.tsx
        reveal.tsx
    features/
      home/components/
      about/components/
      projects/
        components/
        server/queries.ts
        types.ts
      services/
        components/
        server/queries.ts
        types.ts
      contact/
        components/
        schemas/contact-schema.ts
        server/submit-contact.ts
        types.ts
      privacy/components/
    content/
      pt-BR/
        profile.ts
        projects.ts
        services.ts
        navigation.ts
      en/
        profile.ts
        projects.ts
        services.ts
        navigation.ts
    i18n/
      config.ts
      dictionaries.ts
      messages/
        pt-BR.json
        en.json
    providers/
      app-providers.tsx
      theme-provider.tsx
    hooks/
      use-theme.ts
    lib/
      cn.ts
      seo.ts
      links.ts
      server/
        env.ts
        email.ts
        rate-limit.ts
    config/
      site.ts
      contact.ts
    styles/globals.css
    proxy.ts
  tests/
    unit/
    e2e/
  docs/
    decisions.md
    content-checklist.md
    deployment.md
  .env.example
  .gitignore
  eslint.config.mjs
  next.config.ts
  postcss.config.mjs
  package.json
  package-lock.json
  tsconfig.json
  README.md
  ROADMAP.md
```

O layout raiz deve ficar em `app/[locale]/layout.tsx`, incluindo `html`, `body` e o atributo `lang` validado. O layout `(site)` contém header e footer. Não criar um layout raiz adicional que fixe incorretamente o idioma.

O `proxy.ts` deve tratar a entrada sem idioma e ignorar APIs, arquivos públicos e recursos internos do Next.js. Idiomas inválidos e slugs inexistentes devem resultar em 404, sem loops de redirecionamento. Confirmar a convenção equivalente se o projeto existente usar outra versão do framework.

As páginas servidor devem ler os módulos de conteúdo diretamente, sem chamar uma API interna apenas para acessar os mesmos dados. Não usar exportação puramente estática se o endpoint de contato depender do runtime Next.js.

## 6. Inventário de componentes por funcionalidade

| Funcionalidade | Componentes | Responsabilidade |
| --- | --- | --- |
| Home | HeroSection, ExpertiseSection, FeaturedProjectsSection | Apresentação e prova técnica |
| Home | ServicesOverviewSection, WorkProcessSection, ContactCtaSection | Serviços, processo e conversão |
| Sobre | ProfileSection, CareerTimeline, SkillsGrid, ResumeDownload | Perfil profissional verificável |
| Projetos | ProjectCard, ProjectGrid, ProjectFilters | Descoberta e filtros |
| Projeto | ProjectGallery, ProjectCaseStudy, ProjectLinks | Imagens, contribuição, resultado e links |
| Serviços | ServiceCard, ServiceGrid, ServiceDetails | Oferta e escopo |
| Serviço | DeliverablesList, ServiceFaq | Entregáveis e dúvidas recorrentes |
| Contato | ContactForm, ContactChannels, SubmissionFeedback | Coleta mínima e feedback de envio |
| Privacidade | ConsentBanner, ConsentSettings | Somente se houver recursos opcionais que dependam da escolha |

Compartilhar componentes quando houver repetição real. Manter regras de negócio dentro da respectiva feature e evitar arquivos de página excessivamente grandes.

## 7. Modelo de estado

| Estado ou dado | Fonte de verdade | Persistência |
| --- | --- | --- |
| Tema escolhido | ThemeProvider: dark, light ou system | localStorage |
| Tema efetivamente exibido | Derivado da escolha e do sistema | Não duplicar |
| Idioma | Segmento da URL | Própria URL |
| Busca, tecnologia e categoria | Search params | Própria URL |
| Serviço pré-selecionado | `?servico=slug` na entrada do formulário | Própria URL |
| Menu móvel | Estado local de MobileNav | Nenhuma |
| Galeria | Estado local de ProjectGallery | Nenhuma |
| Campos, erros e envio | Estado local de ContactForm | Não persistir dados pessoais por padrão |
| Projetos, serviços e perfil | Módulos de conteúdo no servidor | Git |
| Consentimento, se necessário | Provider específico | Cookie ou localStorage versionado |

Não criar loading global, store de projetos ou store separado de idioma. Botões de orçamento levam à página de contato com query string; nenhum modal global é necessário no MVP.

Evitar flash do tema e divergência de hidratação. Não acessar `window` ou `localStorage` durante renderização no servidor. Se adotar uma biblioteca de tema, ela deve ser a única responsável pela preferência e persistência.

## 8. Contratos de conteúdo e contato

### Projeto

Campos: `id`, `slug`, `title`, `summary`, `category`, `technologies`, `kind`, `status`, `featured`, `cover`, `gallery`, `challenge`, `solution`, `contribution`, `outcomes`, `repositoryUrl`, `liveUrl`.

- `category`: web, dashboard, automation ou ai.
- `kind`: personal, professional ou demo.
- `status`: live, in-progress ou archived.
- Imagens contêm caminho e texto alternativo.
- Resultados e links são opcionais: não renderizar métricas fictícias ou botões sem destino.
- O estudo de caso deve explicar a contribuição individual de Renan, inclusive quando o trabalho foi de equipe.
- Projetos de estudo podem ser publicados desde que claramente identificados.

### Serviço

Campos: `id`, `slug`, `title`, `summary`, `problems`, `deliverables`, `process`, `faq` e `ctaLabel`.

Não fixar preços, prazos comerciais, garantias de resultado ou disponibilidade sem definição do responsável.

### Contato

Campos obrigatórios: nome, e-mail, serviço de interesse e descrição da necessidade. Empresa, telefone, faixa de orçamento e prazo desejado são opcionais. Incluir link para a política de privacidade próximo ao envio e não exigir autorização para marketing.

Fluxo: `ContactForm` → `POST /api/contact` → validação no servidor → proteção contra abuso → integração de e-mail → resposta estruturada.

Respostas esperadas: 200 para solicitação aceita pelo provedor; 400 para dados inválidos; 429 para excesso de solicitações; 503 para integração indisponível; erro genérico apropriado para falhas inesperadas. Não afirmar entrega na caixa de entrada apenas porque o provedor aceitou a mensagem.

Durante testes, utilizar adaptador de e-mail controlado. Em produção sem credenciais, o endpoint deve indicar indisponibilidade e a interface oferecer um canal alternativo configurado. Nunca retornar sucesso fictício.

### Configuração de ambiente

Definir `.env.example` com descrições e valores vazios ou seguros, sem segredos reais. Nomes finais devem seguir o adaptador escolhido.

| Configuração | Exposição |
| --- | --- |
| URL pública do site | Pode ser pública |
| GitHub, LinkedIn e WhatsApp profissional | Configuração pública, após validação |
| Provedor de e-mail e chave de API | Apenas servidor |
| Remetente verificado e destinatário | Apenas servidor |
| Credenciais do limitador de requisições, se externo | Apenas servidor |

Não usar prefixo `NEXT_PUBLIC_` para credenciais. Proteger módulos sensíveis com a convenção `server-only` quando aplicável. Não registrar o corpo completo das mensagens nem dados pessoais em logs.

## 9. Etapas de implementação

### Etapa 0 — Inspeção e preparação

- [x] Ler instruções locais, conferir Git, scripts, dependências e lockfile.
- [x] Verificar se o projeto já existe e identificar o que pode ser reutilizado.
- [x] Registrar versões, escolhas e limitações em `docs/decisions.md`.
- [x] Criar `docs/content-checklist.md` com materiais disponíveis e pendências.

**Aceite:** ambiente e comandos de execução identificados; nenhuma alteração anterior foi perdida; decisões registradas. Em um repositório existente, registrar erros anteriores à tarefa.

### Etapa 1 — Fundação técnica

- [x] Configurar Next.js, TypeScript, Tailwind e lint.
- [x] Criar scripts de desenvolvimento, build, typecheck e validações necessárias.
- [x] Configurar alias `@/*`, estilos globais e tokens.
- [x] Implementar rotas por idioma, layouts, tratamento de 404 e redirecionamento inicial.
- [x] Criar componentes básicos e estrutura responsiva de navegação.
- [x] Implementar tema e persistência.

**Aceite:** servidor local inicia; `/` leva a `/pt-BR`; `/en` funciona; tema persiste sem erro de hidratação; build, lint e typecheck passam.

### Etapa 2 — Conteúdo e páginas institucionais

- [x] Tipar conteúdo de perfil, serviços e projetos.
- [x] Implementar home, sobre e rodapé.
- [x] Inserir textos PT-BR e EN coerentes com o perfil conhecido.
- [x] Configurar canais profissionais disponíveis e ocultar os ausentes.
- [x] Exibir download de currículo somente quando o arquivo real existir.
- [x] Implementar navegação por teclado e preferência de movimento reduzido.

**Aceite:** as duas versões têm navegação e conteúdo completos para esta etapa; nenhum link aponta para `#` como destino fictício; não há alegações profissionais inventadas.

### Etapa 3 — Portfólio e estudos de caso

- [x] Implementar listagem e páginas individuais.
- [x] Usar projetos confirmados e materiais públicos ou autorizados.
- [x] Implementar busca textual e filtros de tecnologia e categoria na URL.
- [x] Preservar filtros ao trocar idioma quando fizer sentido.
- [x] Implementar estado vazio, limpeza de filtros e 404 para slug inválido.
- [x] Exibir imagens com dimensões estáveis, texto alternativo e links verificados.

**Aceite:** filtros funcionam ao compartilhar a URL e ao usar voltar/avançar; acesso direto a estudo de caso funciona; nenhum projeto é apresentado como entregue se for apenas proposta.

**Dependência editorial:** preparar a arquitetura para pelo menos três estudos de caso. Se não houver material para três, publicar apenas os confirmados e registrar a lacuna, sem criar trabalhos fictícios.

### Etapa 4 — Serviços e conversão

- [x] Implementar listagem e detalhe das quatro frentes de serviço.
- [x] Exibir problemas atendidos, entregáveis, processo e FAQ.
- [x] Fazer CTA levar a `/[locale]/contato?servico=slug`.
- [x] Validar a query string e pré-selecionar apenas serviços existentes.
- [x] Implementar contato por WhatsApp se o número profissional estiver definido.

**Aceite:** cada serviço leva ao formulário com a seleção correta; parâmetros desconhecidos não quebram a página; chamadas de ação funcionam no celular e desktop.

### Etapa 5 — Formulário e integração

- [x] Implementar formulário acessível, validações e estados de envio.
- [x] Validar novamente todos os dados no endpoint.
- [x] Definir limites de tamanho e proteção contra submissões abusivas.
- [x] Usar limitador adequado ao ambiente de produção; não considerar memória local compartilhada entre instâncias serverless. Implementado (adaptador Upstash via REST); credenciais pendentes, sem elas usa memória local.
- [x] Integrar adaptador de e-mail e impedir envios duplicados enquanto houver requisição pendente. Implementado (Resend + adaptador de teste); integração real pendente de credenciais.
- [x] Tratar sucesso, erros por campo, indisponibilidade e falha de rede.
- [x] Preservar o texto digitado em caso de falha.
- [x] Ajustar a página de privacidade ao comportamento efetivo do site.

**Aceite:** testes controlados cobrem sucesso, entrada inválida, limitação e indisponibilidade; falhas não exibem sucesso; credenciais não aparecem no bundle cliente. Teste real de entrega depende de credenciais e destinatário de teste autorizado.

### Etapa 6 — SEO, acessibilidade e desempenho

- [x] Configurar títulos, descrições e canonical por página e idioma.
- [x] Configurar alternates de idioma e sitemap com URLs válidas.
- [x] Criar imagem de compartilhamento com conteúdo verdadeiro.
- [x] Configurar robots conforme o ambiente de publicação.
- [x] Adicionar dados estruturados pertinentes, sem avaliações ou credenciais inventadas.
- [x] Otimizar imagens, fontes e carregamento de interatividade. next/image, next/font, canvas pausado fora da tela. Métricas Lighthouse ainda não medidas.
- [x] Revisar contraste, foco visível, landmarks, labels e hierarquia de títulos.
- [x] Verificar que páginas continuam legíveis com animações desativadas.

**Aceite:** metadados correspondem ao conteúdo; URLs canônicas usam o domínio configurado; nenhuma informação importante depende exclusivamente de cor ou movimento; métricas são medidas e registradas, sem prometer notas.

### Etapa 7 — Validação e documentação

- [x] Executar build de produção, lint e typecheck.
- [x] Cobrir schema de contato e tratamento de parâmetros com testes unitários úteis.
- [x] Validar navegação, idioma, filtros e formulário com testes de integração ou E2E.
- [x] Conferir visualmente os quatro tamanhos de tela definidos.
- [x] Validar acesso direto, refresh e páginas inexistentes.
- [x] Revisar links e materiais em PT-BR e EN.
- [x] Documentar instalação, scripts, ambiente e edição de conteúdo no README.
- [x] Atualizar este roadmap e registrar limitações restantes.

**Aceite:** falhas introduzidas resolvidas; pendências externas identificadas separadamente; README permite executar o projeto sem conhecimento prévio da implementação.

### Etapa 8 — Preparação de publicação

- [x] Identificar hosting com suporte ao runtime necessário para `/api/contact`. Vercel ou Node.js 20.9+ (docs/deployment.md).
- [x] Documentar variáveis, domínio e verificação do remetente em `docs/deployment.md`.
- [x] Conferir que não há segredos no Git nem placeholders expostos como conteúdo real.
- [x] Definir canal de contato operacional ou registrar bloqueio de lançamento. E-mail público renan.gabba@gmail.com; formulário depende do provedor.
- [x] Publicar somente com destino e autorização disponíveis no contexto. Vercel, autorizado pelo Renan.
- [x] Após publicação, verificar páginas, recursos e formulário no ambiente real com teste autorizado. Páginas, 404, idiomas, robots, sitemap e canonical verificados; formulário responde 503 (e-mail ainda não configurado), sem sucesso fictício.
- [x] Registrar URL e commit publicado, quando houver publicação. https://renan-augusto-dev.vercel.app (repositório renanfrontend/portfolio-2026, commit 023a00d).

**Aceite:** preparação reproduzível; se o deploy ocorrer, registrar evidência da URL ativa. Sem deploy executado, relatar “pronto para publicar” apenas se não houver bloqueios funcionais para isso.

## 10. Critérios finais de conclusão

- [x] Site responsivo, navegável por teclado e utilizável em PT-BR e EN.
- [x] Tema escuro inicial com preferência persistente.
- [x] Projetos e serviços com conteúdo verificável e links funcionais.
- [x] Busca e filtros compartilháveis pela URL.
- [ ] Formulário com resultado real e tratamento honesto de indisponibilidade. Implementado; integração pendente (tratamento de indisponibilidade verificado).
- [x] Canal de contato funcional no lançamento.
- [x] Nenhum segredo enviado ao navegador ou versionado.
- [x] Build, typecheck e lint aprovados.
- [x] Fluxos críticos validados; resultados documentados.
- [x] README, decisões e checklist editorial atualizados.
- [x] Status de publicação comunicado com precisão.

Não marcar “concluído” se um critério essencial ainda estiver bloqueado. É permitido registrar “implementado; integração pendente” para distinguir código entregue de operação verificada.

## 11. Backlog após o MVP

Priorizar conforme demanda, sem implementar automaticamente:

1. Mais estudos de caso com demonstrações reais de automação e IA.
2. Artigos técnicos em MDX para demonstrar profundidade e apoiar descoberta orgânica.
3. Integração de dados públicos do GitHub com cache e tratamento de indisponibilidade.
4. Agenda de reuniões e CRM, se houver volume de contatos que justifique.
5. Analytics de conversão, com definição do tratamento de dados antes da integração.
6. CMS, quando a frequência de edição justificar o custo operacional.
7. Experiências 3D leves, após medir o impacto em dispositivos móveis.
8. Assistente de IA com escopo, custos, privacidade e limites definidos.

## 12. Materiais externos a confirmar

| Material | Tratamento enquanto ausente |
| --- | --- |
| Foto profissional | Omitir retrato ou usar composição tipográfica neutra |
| Currículo atualizado | Ocultar botão de download |
| Projetos selecionados e autorização de exposição | Criar suporte técnico; listar apenas os confirmados |
| Screenshots reais | Solicitar ou capturar a aplicação autorizada; não inventar interfaces |
| LinkedIn, e-mail e WhatsApp profissional | Configurar somente destinos confirmados |
| Datas e descrições profissionais | Usar apenas dados fornecidos ou validados |
| Domínio e hosting | Manter preparação local e documentar pendência |
| Provedor de e-mail e credenciais | Implementar adaptador e testes; sinalizar integração pendente |

Essas lacunas não impedem construir o layout, os componentes, os contratos e os testes controlados. Não expor uma lista de pendências técnicas aos visitantes do site.

## 13. Registro de progresso

Ao final de cada etapa, adicionar uma entrada com este formato:

```text
Data:
Etapa:
Status: pendente | em andamento | concluída | bloqueada
Entregas:
Arquivos principais:
Validações executadas e resultados:
Pendências ou bloqueios:
Próxima ação:
Commit, se houver:
```

Antes de retomar uma sessão, ler este registro e verificar o estado real dos arquivos. Não repetir etapas concluídas sem motivo concreto.

## 14. Prompt inicial para Claude Code

```text
Leia o ROADMAP.md na raiz deste projeto e as instruções locais existentes.
Inspecione o repositório, preserve alterações atuais e implemente o MVP
descrito no roadmap usando React, Next.js, TypeScript e Tailwind CSS.

Comece pela primeira etapa pendente e avance pelas etapas executáveis,
atualizando os checkboxes e o registro de progresso com evidências reais.
Não pare após apresentar um plano. Tome decisões técnicas rotineiras e
documente as escolhas relevantes.

Use conteúdo verdadeiro, componentes acessíveis, PT-BR e EN, tema escuro
inicial e a divisão de estado definida no documento. Não invente projetos,
resultados profissionais, links ou integrações funcionando.

Quando faltarem credenciais ou materiais, conclua as partes independentes
e registre exatamente o bloqueio. Execute as validações relevantes antes
de marcar uma etapa como concluída. Ao final, informe o que funciona,
como executar, quais verificações passaram e o que falta para publicar.
```

## 15. Referências técnicas

Consultar as versões atuais durante a implementação:

- [Estrutura do App Router](https://nextjs.org/docs/app/getting-started/project-structure)
- [Server e Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Tailwind CSS com Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)

Os checkboxes refletem o estado verificado em 06/10/2026; itens abertos dependem de credenciais, destino de publicação ou autorização.

### Registro de 06/10/2026

```text
Data: 06/10/2026
Etapa: 0 a 7 (e preparação da 8)
Status: concluída (MVP); etapa 8 bloqueada por destino e credenciais
Entregas: projeto Next.js 16 em C:Projetosenan-portfolio com rotas pt-BR/en,
  home, sobre (currículo PDF), 8 estudos de caso com busca/filtros na URL,
  4 serviços com detalhe e FAQ, contato com validação cliente/servidor,
  /api/contact (Resend ou adaptador de teste, limite de requisições),
  privacidade, SEO (canonical, alternates, sitemap, robots, OG, JSON-LD),
  tema escuro/claro/sistema, retrato em meio-tom e abertura em matriz de pontos.
Arquivos principais: src/proxy.ts, src/app/[locale]/**, src/features/**,
  src/content/**, src/i18n/**, docs/*.md, README.md, .env.example
Validações executadas e resultados:
  npm run lint: ok · npm run typecheck: ok · npm test: 22/22 ok
  npm run build: ok (54 páginas) · npx playwright test: 29/29 ok (desktop + mobile)
  Rotas: / -> 307 /pt-BR; /fr, /pt-BR/projetos/inexistente -> 404
  Sem rolagem horizontal em 360, 768, 1024 e 1440 px; contraste dos tokens >= 4.5:1
  Nenhuma credencial no bundle do cliente (.next/static)
Pendências ou bloqueios: credenciais do Resend e domínio verificado; hospedagem e
  domínio; Upstash opcional; métricas Lighthouse; revisão editorial (docs/content-checklist.md)
Próxima ação: definir hospedagem/domínio, configurar variáveis e publicar
Commit, se houver: nenhum (repositório git iniciado, sem commits)
```

### Registro de publicação (06/10/2026)

```text
Etapa: 8
Status: concluída (publicação); integração de e-mail pendente
Entregas: repositório público https://github.com/renanfrontend/portfolio-2026,
  deploy na Vercel em https://renan-augusto-dev.vercel.app com deploy automático a cada push
Validações no ambiente real: / -> 307 /pt-BR; páginas pt-BR/en 200; /fr e slug inválido 404;
  robots e sitemap com o domínio oficial; canonical correto; API 400 para dados inválidos;
  formulário mostra indisponibilidade (503) com e-mail alternativo
Pendências: RESEND_API_KEY/EMAIL_PROVIDER/CONTACT_FROM_EMAIL na Vercel; domínio próprio
  (renanaugusto.com.br, renanaugusto.dev.br e renanaugusto.dev estavam livres em 06/10/2026)
Commit publicado: 023a00d
```
