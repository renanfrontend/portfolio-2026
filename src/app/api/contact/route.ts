import { OTHER_SERVICE } from "@/config/contact";
import { submitContact } from "@/features/contact/server/submit-contact";
import { getServices, getServiceSlugs } from "@/features/services/server/queries";
import { getDictionary } from "@/i18n/dictionaries";
import { getEmailAdapter } from "@/lib/server/email";
import { getServerEnv } from "@/lib/server/env";
import { clientKeyFromHeaders, getRateLimiter } from "@/lib/server/rate-limit";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "validation", fieldErrors: {} }, { status: 400 });
  }

  const env = getServerEnv();
  const result = await submitContact(payload, clientKeyFromHeaders(request.headers), {
    email: getEmailAdapter(env),
    limiter: getRateLimiter(env),
    serviceSlugs: getServiceSlugs(),
    to: env.contactTo,
    labels: contactLabels(),
  });

  return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}

/** Nomes em português para o e-mail que chega ao Renan. */
function contactLabels() {
  const form = getDictionary("pt-BR").contact.form;
  const services = Object.fromEntries(getServices("pt-BR").map((service) => [service.slug, service.title]));
  return { services: { ...services, [OTHER_SERVICE]: form.serviceOther }, budgets: form.budgets };
}
