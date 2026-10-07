import { GithubIcon, LinkedinIcon, MailIcon, WhatsappIcon } from "@/components/shared/icons";
import { formatWhatsapp, getWhatsappNumber } from "@/config/contact";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { whatsappHref } from "@/lib/links";

/** Canais diretos; o WhatsApp só aparece com um número profissional configurado. */
export function ContactChannels({ dict }: { dict: Dictionary }) {
  const t = dict.contact;
  const whatsapp = getWhatsappNumber();

  const channels = [
    { label: t.email, value: siteConfig.email, href: `mailto:${siteConfig.email}`, icon: MailIcon, external: false },
    { label: t.linkedin, value: "renan-augusto-santos", href: siteConfig.linkedin, icon: LinkedinIcon, external: true },
    { label: t.github, value: "renanfrontend", href: siteConfig.github, icon: GithubIcon, external: true },
    ...(whatsapp
      ? [{ label: t.whatsapp, value: formatWhatsapp(whatsapp), href: whatsappHref(whatsapp, t.whatsappTemplates.default), icon: WhatsappIcon, external: true }]
      : []),
  ];

  return (
    <section aria-labelledby="channels-title">
      <h2 id="channels-title" className="text-2xl font-bold text-fg">
        {t.channelsTitle}
      </h2>
      <ul className="mt-6 grid gap-3">
        {channels.map(({ label, value, href, icon: Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-4 rounded-2xl card-neon p-4 transition-colors"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                <Icon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm text-fg-subtle">{label}</span>
                <span className="block truncate font-medium text-fg">{value}</span>
              </span>
              {external && <span className="sr-only">{dict.common.opensInNewTab}</span>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
