"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { getAcquisition, getConsent, initializeAnalytics, setConsent, subscribeConsent, trackEvent, withdrawAnalytics } from "@/lib/analytics";

const copy = {
  "pt-BR": {
    title: "Posso medir as visitas?",
    text: "Com sua permissão, uso o Google Analytics para entender quais páginas ajudam você a encontrar meus serviços. Os campos do formulário não são enviados ao Analytics.",
    accept: "Permitir estatísticas", reject: "Continuar sem permitir", privacy: "Privacidade", settings: "Preferências de estatísticas", disable: "Desativar estatísticas",
  },
  en: {
    title: "May I measure visits?",
    text: "With your permission, I use Google Analytics to understand which pages help you find my services. Form fields are not sent to Analytics.",
    accept: "Allow analytics", reject: "Continue without analytics", privacy: "Privacy", settings: "Analytics preferences", disable: "Disable analytics",
  },
};

export function TrafficAnalytics({ locale, measurementId }: { locale: Locale; measurementId: string }) {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => null);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const lastPage = useRef<string | null>(null);
  const t = copy[locale];
  const validId = /^G-[A-Z0-9]+$/.test(measurementId);

  useEffect(() => {
    if (!validId || consent !== "granted") return;
    getAcquisition();
    if (ready && lastPage.current !== pathname) {
      trackEvent("page_view");
      lastPage.current = pathname;
    }
  }, [consent, pathname, ready, validId]);

  useEffect(() => {
    if (!validId || consent !== "granted" || !ready) return;
    function onClick(event: MouseEvent) {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.origin);
      if (url.hostname === "wa.me" || url.hostname === "api.whatsapp.com") trackEvent("whatsapp_click");
      else if (url.protocol === "mailto:") trackEvent("email_click");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent, ready, validId]);

  // A rejection in another tab must also unload an already running tag here.
  useEffect(() => {
    if (ready && consent === "denied") withdrawAnalytics();
  }, [ready, consent]);

  if (!validId) return null;
  return (
    <>
      {consent === "granted" && (
        <Script
          id="portfolio-ga4"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
          onReady={() => { initializeAnalytics(measurementId); setReady(true); }}
        />
      )}
      {consent === null ? (
        <section aria-label={t.title} className="fixed bottom-4 left-4 right-4 z-50 max-w-lg rounded-2xl border border-border-strong bg-bg-elevated p-5 shadow-xl sm:right-auto">
          <h2 className="text-lg font-bold text-fg">{t.title}</h2>
          <p className="mt-2 text-sm text-fg-muted">{t.text} <Link href={`/${locale}/privacidade`} className="underline underline-offset-4">{t.privacy}</Link></p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="rounded-lg border border-border-strong px-3 py-2 text-sm text-fg" onClick={() => setConsent("denied")}>{t.reject}</button>
            <button type="button" className="rounded-lg border border-border-strong px-3 py-2 text-sm text-fg" onClick={() => setConsent("granted")}>{t.accept}</button>
          </div>
        </section>
      ) : (
        <div className="border-t border-border bg-bg-elevated px-6 py-3 text-center text-xs text-fg-muted">
          <button type="button" className="underline underline-offset-4" aria-label={t.settings} onClick={() => consent === "granted" ? withdrawAnalytics() : setConsent("granted")}>
            {consent === "granted" ? t.disable : t.accept}
          </button>
        </div>
      )}
    </>
  );
}
