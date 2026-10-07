import { CheckIcon, ClockIcon, WhatsappIcon } from "@/components/shared/icons";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { getWhatsappNumber } from "@/config/contact";
import { whatsappHref } from "@/lib/links";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { formatPrice, hireHref } from "../packages";
import type { LocalizedPackage, PackageStatus } from "../types";

const statusDot: Record<PackageStatus, string> = {
  available: "bg-success",
  limited: "bg-[#f5b544]",
  unavailable: "bg-fg-subtle",
};

type PackageCardProps = { item: LocalizedPackage; locale: Locale; labels: Dictionary["hire"] };

export function PackageCard({ item, locale, labels }: PackageCardProps) {
  const highlighted = item.badge === "popular";
  const price = formatPrice(item.price, locale);
  const unavailable = item.status === "unavailable";
  // Escopos variáveis (ex.: MVP) abrem uma conversa no WhatsApp; sem número configurado, voltam ao formulário.
  const whatsapp = getWhatsappNumber();
  const talkOnWhatsapp = item.cta === "whatsapp" && whatsapp && item.whatsappMessage;

  return (
    <article
      aria-labelledby={`pacote-${item.id}`}
      className={cn(
        "relative flex h-full flex-col rounded-2xl card-neon p-7",
        highlighted && "card-neon-strong xl:-translate-y-2",
      )}
    >
      {item.badge && (
        <p
          className={cn(
            "absolute -top-3 left-7 rounded-full px-3 py-1 text-xs font-bold",
            highlighted ? "bg-gradient-to-r from-accent via-blue to-violet text-accent-fg" : "border border-border-strong bg-bg text-fg-muted",
          )}
        >
          {labels.badges[item.badge]}
        </p>
      )}

      <h2 id={`pacote-${item.id}`} className="mt-2 text-xl font-bold text-fg xl:min-h-[2.8rem]">
        {item.name}
      </h2>
      <p className="mt-2 text-[0.95rem] text-fg-muted xl:min-h-[6.25rem]">{item.description}</p>

      <div className="mt-6 border-y border-border py-5">
        {price ? (
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            {item.priceFrom && <span className="text-sm text-fg-subtle">{labels.priceFrom}</span>}
            <span className="font-display text-3xl font-bold text-fg">{price}</span>
            {item.pricePeriod === "month" && <span className="text-sm text-fg-subtle">{labels.perMonth}</span>}
          </p>
        ) : (
          <p className="font-display text-2xl font-bold text-fg">{labels.priceOnRequest}</p>
        )}
        {price && item.installments && <p className="mt-1 text-xs text-fg-subtle">{labels.installments}</p>}
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-fg-muted">
          <span className={cn("size-2 rounded-full", statusDot[item.status])} aria-hidden />
          {labels.statuses[item.status]}
        </p>
      </div>

      <h3 className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-fg-subtle">{labels.deliverables}</h3>
      <ul className="mt-3 grid flex-1 content-start gap-2.5 text-[0.95rem] text-fg">
        {item.deliverables.map((deliverable) => (
          <li key={deliverable} className="flex gap-2.5">
            <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-accent-strong" />
            {deliverable}
          </li>
        ))}
      </ul>

      <p className="mt-6 flex items-center gap-2 text-sm text-fg-muted">
        <ClockIcon width={16} height={16} className="shrink-0 text-fg-subtle" />
        <span>
          {labels.deadline}: <span className="font-semibold text-fg">{item.deadline ?? labels.deadlineDefault}</span>
        </span>
      </p>

      {unavailable ? (
        <span
          aria-disabled="true"
          className="mt-6 inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full border border-border text-sm font-semibold text-fg-subtle"
        >
          {labels.ctaUnavailable}
        </span>
      ) : talkOnWhatsapp ? (
        <a
          href={whatsappHref(whatsapp, item.whatsappMessage!)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses(highlighted ? "primary" : "secondary", "lg", "mt-6 w-full whitespace-nowrap px-4")}
        >
          <WhatsappIcon width={18} height={18} className="shrink-0" />
          {labels.ctaTalk}
          <span className="sr-only">
            : {item.name} {labels.opensInNewTab}
          </span>
        </a>
      ) : (
        <ButtonLink href={hireHref(item, locale)} variant={highlighted ? "primary" : "secondary"} size="lg" className="mt-6 w-full">
          {labels.cta}
          <span className="sr-only">: {item.name}</span>
        </ButtonLink>
      )}
    </article>
  );
}
