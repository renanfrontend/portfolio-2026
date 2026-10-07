import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { ArrowLeftIcon, CheckIcon, ClockIcon, WhatsappIcon } from "@/components/shared/icons";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { getSchedulingUrl, getWhatsappNumber } from "@/config/contact";
import { TrackPurchase } from "@/features/packages/components/track-purchase";
import { getPaymentGateway, type PaidOrder } from "@/features/packages/server/payments";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { localePath, whatsappHref } from "@/lib/links";
import { getServerEnv } from "@/lib/server/env";

export async function generateMetadata({ params }: PageProps<"/[locale]/contratar/sucesso">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // Página pessoal de cada pedido: fora do Google.
  return { title: getDictionary(locale).hire.success.metaTitle, robots: { index: false, follow: false } };
}

export default async function HireSuccessPage({ params, searchParams }: PageProps<"/[locale]/contratar/sucesso">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <Suspense
          fallback={
            <p role="status" className="text-center text-fg-muted">
              {dict.hire.success.loading}
            </p>
          }
        >
          <OrderConfirmation searchParams={searchParams} locale={locale} dict={dict} />
        </Suspense>
      </div>
    </Container>
  );
}

const param = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");

/** O pedido só aparece quando a sessão existe no Stripe e pertence ao número de pedido da URL. */
async function findOrder(sessionId: string, orderId: string): Promise<PaidOrder | null> {
  // Consulta sempre na hora: o resultado depende do pagamento e nunca vai para o cache.
  await connection();
  const gateway = getPaymentGateway(getServerEnv());
  if (!gateway || !sessionId || !orderId) return null;
  try {
    const order = await gateway.retrieveOrder(sessionId);
    return order?.orderId === orderId ? order : null;
  } catch (error) {
    console.error("[sucesso] Falha ao consultar o Stripe:", error instanceof Error ? error.message : "erro desconhecido");
    return null;
  }
}

async function OrderConfirmation({
  searchParams,
  locale,
  dict,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  dict: Dictionary;
}) {
  const query = await searchParams;
  const t = dict.hire.success;
  const order = await findOrder(param(query.session_id), param(query.order_id));
  const whatsapp = getWhatsappNumber();
  const home = (
    <ButtonLink href={localePath(locale)} variant="ghost" className="mt-10">
      <ArrowLeftIcon width={16} height={16} />
      {t.home}
    </ButtonLink>
  );

  if (!order || order.status === "failed") {
    return (
      <section className="text-center">
        <h1 className="text-3xl font-bold text-fg sm:text-4xl">{t.notFoundTitle}</h1>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">{t.notFoundText}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={localePath(locale, "/contratar")} size="lg">
            {t.backToPackages}
          </ButtonLink>
          {whatsapp && (
            <a
              href={whatsappHref(whatsapp, t.notFoundWhatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary", "lg")}
            >
              <WhatsappIcon width={18} height={18} />
              {t.whatsapp}
            </a>
          )}
        </div>
        {home}
      </section>
    );
  }

  const paid = order.status === "paid";
  const firstName = order.customer.name.split(" ")[0] || order.customer.name;
  const amount =
    new Intl.NumberFormat(locale, { style: "currency", currency: order.currency }).format(order.amountInCents / 100) + (order.recurring ? t.perMonth : "");
  const whatsappMessage = t.whatsappMessage.replace("{package}", order.packageName).replace("{order}", order.orderId);
  const schedulingUrl = getSchedulingUrl();
  const steps = paid ? t.steps : [t.steps[0], t.pendingEmailStep, t.steps[2]];

  return (
    <section aria-labelledby="order-title">
      {paid && (
        <TrackPurchase
          orderId={order.orderId}
          value={order.amountInCents / 100}
          currency={order.currency}
          packageId={order.packageId}
          packageName={order.packageName}
        />
      )}
      <div className="text-center">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold",
            paid
              ? "border-success/40 bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-success"
              : "border-border-strong bg-surface text-fg-muted",
          )}
        >
          {paid ? <CheckIcon width={16} height={16} /> : <ClockIcon width={16} height={16} />}
          {paid ? t.paidBadge : t.pendingBadge}
        </span>
        <h1 id="order-title" className="mt-6 text-3xl font-bold text-fg sm:text-4xl">
          {(paid ? t.paidTitle : t.pendingTitle).replace("{name}", firstName)}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">{paid ? t.paidText : t.pendingText}</p>
      </div>

      {/* Resumo do pedido */}
      <dl className="mt-10 grid gap-4 rounded-2xl card-neon card-neon-strong p-6 sm:grid-cols-3">
        {(
          [
            [t.order, order.orderId, "font-mono"],
            [t.package, order.packageName, ""],
            [t.amount, amount, "font-display"],
          ] as const
        ).map(([label, value, font]) => (
          <div key={label}>
            <dt className="font-mono text-xs uppercase tracking-[0.15em] text-fg-subtle">{label}</dt>
            <dd className={cn("mt-1 font-bold text-fg", font)}>{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-2xl font-bold text-fg">{t.stepsTitle}</h2>
      <ol className="mt-6 grid gap-4">
        {steps.map((step, index) => {
          const done = index === 0 || (paid && index === 1);
          return (
            <li key={step} className="flex items-start gap-4">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border font-display font-bold",
                  done ? "border-success/50 text-success" : "border-accent/60 text-accent",
                )}
              >
                {done ? <CheckIcon width={16} height={16} /> : index + 1}
              </span>
              <p className="pt-1.5 text-fg">{step}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        {schedulingUrl ? (
          <a href={schedulingUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
            {t.schedule}
            <span className="sr-only"> {dict.common.opensInNewTab}</span>
          </a>
        ) : (
          whatsapp && (
            <a href={whatsappHref(whatsapp, whatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
              <WhatsappIcon width={18} height={18} />
              {t.scheduleWhatsapp}
              <span className="sr-only"> {dict.hire.opensInNewTab}</span>
            </a>
          )
        )}
        {schedulingUrl && whatsapp && (
          <a href={whatsappHref(whatsapp, whatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "lg")}>
            <WhatsappIcon width={18} height={18} />
            {t.whatsapp}
            <span className="sr-only"> {dict.hire.opensInNewTab}</span>
          </a>
        )}
      </div>
      {home}
    </section>
  );
}
