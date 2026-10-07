export type WhatsappTemplates = {
  default: string;
  service: string;
  project: string;
  about: string;
};

export type WhatsappContext = {
  /** slug -> nome legível, para citar o serviço ou projeto na mensagem. */
  services: Record<string, string>;
  projects: Record<string, string>;
};

/**
 * Escolhe a mensagem pronta do WhatsApp conforme a página:
 * serviço e projeto citam o nome; "Sobre" fala de vaga; o resto usa a mensagem geral.
 */
export function whatsappMessageFor(pathname: string | null, templates: WhatsappTemplates, context: WhatsappContext): string {
  const [, , section, slug] = (pathname ?? "").split("/");

  if (section === "servicos" && slug && context.services[slug]) {
    return templates.service.replace("{service}", context.services[slug]);
  }
  if (section === "projetos" && slug && context.projects[slug]) {
    return templates.project.replace("{project}", context.projects[slug]);
  }
  if (section === "sobre") return templates.about;
  return templates.default;
}
