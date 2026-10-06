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
- [ ] **WhatsApp profissional**: definir `NEXT_PUBLIC_WHATSAPP_NUMBER` se quiser o canal.
- [ ] **Galeria**: os estudos de caso têm só a imagem de capa; o campo `gallery` aceita mais telas.
- [ ] Revisar as datas/certificações em "Formação" (vieram do portfólio anterior).
- [ ] Atualizar o currículo em PDF quando houver nova versão (mesmo caminho em `public/documents/`).

## Como editar

- Textos de interface: `src/i18n/messages/pt-BR.json` e `en.json` (mesmas chaves).
- Perfil: `src/content/<idioma>/profile.ts`.
- Projetos: dados fixos em `src/content/projects-base.ts`; textos em `src/content/<idioma>/projects.ts` (a chave é o `id`).
- Serviços: `src/content/<idioma>/services.ts` (o `slug` precisa ser igual nos dois idiomas).
- Política de privacidade: `src/content/privacy.ts` (atualize se o site passar a usar analytics, cookies ou banco de dados).
