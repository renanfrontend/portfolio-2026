# Checklist editorial

Estado dos materiais em 06/10/2026.

## Disponível e publicado

| Material | Origem | Onde está |
| --- | --- | --- |
| Foto de perfil | Avatar do GitHub (autorizado pelo Renan) | `public/images/profile/renan-github.jpg` |
| Currículo PT e EN | Repositório `renanfrontend/renan-portfolio` | `public/documents/` |
| Experiência, formação, competências | Currículo e portfólio anterior | `src/content/*/profile.ts` |
| E-mail público | Confirmado pelo Renan | `src/config/site.ts` |
| LinkedIn e GitHub | README do perfil no GitHub | `src/config/site.ts` |
| 8 estudos de caso | Repositórios públicos no GitHub | `src/content/projects-base.ts` e `src/content/*/projects.ts` |
| Screenshots | Portfólio anterior + capturas das demos públicas | `public/images/projects/` |

## Pendências (não bloqueiam o layout)

- [ ] **Confirmar a lista de projetos.** Escolhi os mais completos dos repositórios públicos (pedido do Renan: "meus melhores projetos"). Revisar se algum deve sair ou entrar.
- [ ] **MWM Portal**: confirmar se o texto (já publicado no portfólio anterior) pode continuar no site e se há screenshot autorizado.
- [ ] **Aster Centro Terapêutico**: confirmar se foi trabalho para cliente (está como "Profissional", conforme o portfólio anterior).
- [ ] **Foto profissional** com fundo neutro melhoraria o retrato em meio-tom (hoje uma máscara aproximada remove o fundo do avatar).
- [x] **WhatsApp profissional**: (11) 96578-1243, confirmado pelo Renan (07/10/2026). Botão flutuante em todas as páginas e canal na página de contato; padrão em `src/config/contact.ts`.
- [ ] **Galeria**: os estudos de caso têm só a imagem de capa; o campo `gallery` aceita mais telas.
- [x] Formação revisada com o Renan (07/10/2026): Tecnólogo em Logística (concluído), pós em Administração Empresarial, ADS na São Judas (1 ano, não concluído) e pós em IA em andamento. Instituição e ano da Logística e da pós em Administração não informados (omitidos).
- [ ] **Currículo em PDF desatualizado:** começa em 2020 e lista ADS sem indicar que não foi concluído. Substituir por versão atualizada (mesmo caminho em `public/documents/`).

## Adicionar um projeto novo (automático)

1. No repositório **público** do GitHub, clique na engrenagem ⚙ ao lado de **About**.
2. Em **Website**, coloque o link do site publicado (se houver). Com link, o projeto ganha o selo "No ar" e o botão "Ver ao vivo".
3. Em **Topics**, adicione `portfolio-site`. Para ele entrar também nos destaques da home, adicione `portfolio-destaque`.
4. Escreva uma boa **descrição** no About: ela vira o resumo do projeto.
5. Em até 1 hora o projeto aparece no site, sem novo deploy. Tópicos como `ai`, `games` ou `dashboard` definem a categoria; a linguagem e os demais tópicos viram as tecnologias.

Para um estudo de caso completo (desafio, solução, contribuição, screenshot), o projeto pode ser "promovido" a curado em `src/content/projects-base.ts` e `src/content/<idioma>/projects.ts`. Opcional: `GITHUB_TOKEN` na Vercel (token de leitura de repositórios públicos) evita o limite de requisições da API do GitHub.

## Como editar

- Textos de interface: `src/i18n/messages/pt-BR.json` e `en.json` (mesmas chaves).
- Perfil: `src/content/<idioma>/profile.ts`.
- Projetos: dados fixos em `src/content/projects-base.ts`; textos em `src/content/<idioma>/projects.ts` (a chave é o `id`).
- Serviços: `src/content/<idioma>/services.ts` (o `slug` precisa ser igual nos dois idiomas).
- Política de privacidade: `src/content/privacy.ts` (atualize se o site passar a usar analytics, cookies ou banco de dados).
