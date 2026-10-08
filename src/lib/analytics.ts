import { acquisitionFromUrl, acquisitionSchema, publicPagePath, type Acquisition } from "./acquisition";

export const CONSENT_KEY = "portfolio-analytics-consent-v1";
const ACQUISITION_KEY = "portfolio-acquisition-v1";
const CONSENT_EVENT = "portfolio-consent-change";
export type AnalyticsConsent = "granted" | "denied" | null;
let memoryConsent: AnalyticsConsent = null;
let configuredId: string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : memoryConsent;
  } catch { return memoryConsent; }
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function setConsent(value: Exclude<AnalyticsConsent, null>) {
  memoryConsent = value;
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Session-only preference. */ }
  if (value === "denied") {
    try { sessionStorage.removeItem(ACQUISITION_KEY); } catch { /* Storage blocked. */ }
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function getAcquisition(): Acquisition | undefined {
  if (typeof window === "undefined" || getConsent() !== "granted") return undefined;
  if (!/^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "")) return undefined;
  try {
    const previous = sessionStorage.getItem(ACQUISITION_KEY);
    if (previous) {
      const parsed = acquisitionSchema.safeParse(JSON.parse(previous));
      if (parsed.success) return parsed.data;
    }
    const acquisition = acquisitionFromUrl(window.location.href, document.referrer);
    sessionStorage.setItem(ACQUISITION_KEY, JSON.stringify(acquisition));
    return acquisition;
  } catch { return undefined; }
}

export function initializeAnalytics(id: string) {
  if (getConsent() !== "granted" || configuredId === id) return;
  window.dataLayer ??= [];
  // gtag.js only processes `arguments` objects; pushing a plain array is silently ignored.
  // eslint-disable-next-line prefer-rest-params
  window.gtag ??= function gtag() { window.dataLayer?.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    // Explicit values avoid sending query strings or a full external referrer.
    page_location: window.location.origin + publicPagePath(window.location.pathname),
    page_referrer: getAcquisition()?.referrerHost ? `https://${getAcquisition()!.referrerHost}/` : "",
    cookie_domain: "none",
  });
  configuredId = id;
}

type FunnelEvent =
  | "page_view"
  | "contact_start"
  | "contact_error"
  | "generate_lead"
  | "whatsapp_click"
  | "email_click"
  // Funil de contratação (/contratar): pacote, valor e número do pedido, nunca dados pessoais.
  | "open_service_modal"
  | "submit_lead_form"
  | "begin_checkout"
  | "purchase_success";
type EventItem = { item_id: string; item_name: string; price?: number; quantity: number };
type EventDetails = {
  service?: string;
  error_type?: string;
  package_id?: string;
  package_name?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: EventItem[];
};

function send(event: FunnelEvent, details: EventDetails, extra: Record<string, unknown> = {}) {
  const acquisition = getAcquisition();
  window.gtag?.("event", event, {
    send_to: configuredId,
    page_location: window.location.origin + publicPagePath(window.location.pathname),
    page_referrer: acquisition?.referrerHost ? `https://${acquisition.referrerHost}/` : "",
    ...(acquisition?.source ? { campaign_source: acquisition.source } : {}),
    ...(acquisition?.medium ? { campaign_medium: acquisition.medium } : {}),
    ...(acquisition?.campaign ? { campaign_name: acquisition.campaign } : {}),
    ...details,
    ...extra,
  });
}

const canTrack = () => typeof window !== "undefined" && Boolean(configuredId) && getConsent() === "granted";

/** Intentionally accepts no form values, email addresses, message or link URL. */
export function trackEvent(event: FunnelEvent, details: EventDetails = {}) {
  if (canTrack()) send(event, details);
}

/**
 * Envia o evento e só então chama `next` (ex.: sair para o Stripe). Sem permissão, sem Analytics
 * ou sem resposta do Google em `timeoutMs`, segue mesmo assim: nunca trava a navegação.
 */
export function trackEventThen(event: FunnelEvent, details: EventDetails, next: () => void, timeoutMs = 600) {
  if (!canTrack() || !window.gtag) return next();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    next();
  };
  const timer = window.setTimeout(finish, timeoutMs);
  try {
    send(event, details, {
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

/** Reload unloads the already executed Google script; no further events after withdrawal. */
export function withdrawAnalytics() {
  setConsent("denied");
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.trim().split("=")[0];
    if (/^_ga(?:_|$)/.test(name)) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
  window.location.reload();
}
