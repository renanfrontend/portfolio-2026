import Script from "next/script";
import { isGaId } from "@/lib/analytics";

/**
 * GA4: a fila do gtag (poucos bytes) nasce antes da hidratação, para nenhum evento se perder;
 * a biblioteca gtag.js só carrega depois que a página fica interativa.
 * Só existe com NEXT_PUBLIC_GA_ID definido; o IP é sempre anonimizado no GA4.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!isGaId(id)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <script id="ga4-init" dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config','${id}',{allow_google_signals:false,allow_ad_personalization_signals:false});` }} />
    </>
  );
}
