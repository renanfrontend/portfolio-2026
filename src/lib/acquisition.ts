import { z } from "zod";

// Only public portfolio paths; never retain arbitrary URLs, queries or fragments.
export function publicPagePath(path: string): string {
  const clean = path.split(/[?#]/)[0];
  return /^\/(pt-BR|en)(\/(sobre|contato|privacidade|servicos|projetos|contratar)(\/[a-z0-9-]+)?)?\/?$/.test(clean)
    ? clean
    : "/";
}

const campaignToken = z.string().max(80).regex(/^[a-z0-9_-]+$/i).optional().catch(undefined);
export const acquisitionSchema = z.object({
  landingPage: z.string().max(160).transform(publicPagePath),
  referrerHost: z.string().max(253).regex(/^[a-z0-9.-]+$/i).optional().catch(undefined),
  source: campaignToken,
  medium: campaignToken,
  campaign: campaignToken,
});
export type Acquisition = z.output<typeof acquisitionSchema>;

export function acquisitionFromUrl(href: string, referrer: string): Acquisition {
  const url = new URL(href);
  let referrerHost: string | undefined;
  try {
    const ref = new URL(referrer);
    if (ref.hostname !== url.hostname && /^https?:$/.test(ref.protocol)) referrerHost = ref.hostname;
  } catch { /* Direct visit or referrer omitted by the browser. */ }
  return acquisitionSchema.parse({
    landingPage: url.pathname,
    referrerHost,
    source: url.searchParams.get("utm_source") ?? undefined,
    medium: url.searchParams.get("utm_medium") ?? undefined,
    campaign: url.searchParams.get("utm_campaign") ?? undefined,
  });
}
