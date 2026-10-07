# SEO (busca orgânica)

## O que o site já faz

- Títulos e descrições por página, com termos de busca, em pt-BR e en; `hreflang` e canonical no domínio oficial.
- Imagem de compartilhamento em todas as páginas (capa nos estudos de caso).
- Favicon (`src/app/icon.svg`), ícone de celular (`apple-icon.tsx`) e `manifest.webmanifest`.
- Dados estruturados (Schema.org) em `src/lib/structured-data.ts`: WebSite e Person (home), ProfilePage (Sobre), CreativeWork (projetos), Service (serviços) e BreadcrumbList.
- `sitemap.xml` com todos os idiomas e `robots.txt` liberando a indexação só em produção.
- A abertura não aparece para robôs de busca e de prévia de links.
- Efeitos pesados só começam quando visíveis e após o carregamento.

## Medição (Lighthouse 12, 07/10/2026, https://www.renanaugusto.com.br/pt-BR)

| | Desempenho | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| Celular (simulado) | 67–74 | 100 | 100 | 100 |
| Computador | 97 | 100 | 100 | 100 |

Celular: LCP 2,7 s, CLS 0, TBT 0,65–1,3 s (o restante é a hidratação do React). Próximo passo possível: reduzir JavaScript da home.

## Passos manuais (gratuitos)

1. Google Search Console: propriedade de **domínio** `renanaugusto.com.br`, verificada por registro TXT no Registro.br; enviar `sitemap.xml`; solicitar indexação das páginas principais.
2. Bing Webmaster Tools: importar a propriedade do Search Console (cobre Bing e DuckDuckGo).
3. Links para o site: LinkedIn (campo Site), perfil e README do GitHub, campo Website dos repositórios.
