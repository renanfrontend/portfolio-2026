import { NextResponse, type NextRequest } from "next/server";
import { projectsBase } from "@/content/projects-base";
import { services } from "@/content/pt-BR/services";
import { defaultLocale, isLocale } from "@/i18n/config";

const localizedSections = new Set(["sobre", "projetos", "servicos", "contato", "privacidade"]);

/** Slugs são estáveis entre idiomas, então a lista do pt-BR vale para todos. */
const knownSlugs: Record<string, Set<string>> = {
  projetos: new Set(projectsBase.map((project) => project.slug)),
  servicos: new Set(services.map((service) => service.slug)),
};

/** Caminho sem rota correspondente: o roteador responde 404 antes de qualquer streaming. */
const NOT_FOUND_PATH = "/_nao-encontrado";

/**
 * - "/" e seções sem idioma (ex.: /projetos) recebem o idioma padrão.
 * - Idiomas inválidos seguem sem alteração e caem no 404 global.
 * - Slugs inexistentes de projetos e serviços viram 404 real. Sem isso, o shell
 *   pré-renderizado começaria o streaming e o notFound() responderia 200.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first = "", section, slug, ...rest] = pathname.split("/");

  if (!isLocale(first)) {
    if (pathname === "/" || localizedSections.has(first)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const slugs = section ? knownSlugs[section] : undefined;
  if (slugs && slug && (!slugs.has(slug) || rest.some(Boolean))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${first}${NOT_FOUND_PATH}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Ignora APIs, recursos internos do Next.js e arquivos com extensão (public/, robots.txt, sitemap.xml...).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
