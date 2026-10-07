/**
 * Eventos do Google Analytics 4. Sem NEXT_PUBLIC_GA_ID (ou com bloqueador de anúncios)
 * as chamadas viram no-op: nunca travam a navegação nem lançam erro.
 */
export type AnalyticsEvent = "open_service_modal" | "submit_lead_form" | "begin_checkout" | "purchase_success";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/**
 * gtag do GA4. Se o script ainda não carregou, o evento entra na fila do dataLayer
 * (o mesmo que o gtag oficial faz) e é enviado assim que o gtag.js chegar.
 */
function gtag(): Gtag | null {
  if (!isGaId(process.env.NEXT_PUBLIC_GA_ID?.trim()) || typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: Gtag; dataLayer?: unknown[] };
  if (typeof w.gtag !== "function") {
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params -- o gtag.js exige o objeto arguments.
      w.dataLayer!.push(arguments);
    };
  }
  return w.gtag;
}

export function trackEvent(name: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  try {
    gtag()?.("event", name, params);
  } catch {
    // Analytics nunca quebra o site.
  }
}

/**
 * Envia o evento e só então executa `next` (ex.: sair para o Stripe), com limite de espera:
 * se o GA não responder em `timeoutMs`, segue mesmo assim.
 */
export function trackEventThen(name: AnalyticsEvent, params: Record<string, unknown>, next: () => void, timeoutMs = 600): void {
  const send = gtag();
  if (!send) return next();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    next();
  };
  const timer = window.setTimeout(finish, timeoutMs);
  try {
    send("event", name, {
      ...params,
      transport_type: "beacon",
      event_callback: () => {
        window.clearTimeout(timer);
        finish();
      },
    });
  } catch {
    window.clearTimeout(timer);
    finish();
  }
}

/** Formato aceito para o ID de medição do GA4, ex.: G-ABC123XYZ. */
export const isGaId = (value: string | undefined): value is string => Boolean(value && /^G-[A-Z0-9]{4,20}$/.test(value));
