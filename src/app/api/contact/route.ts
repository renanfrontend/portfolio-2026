import { submitContact } from "@/features/contact/server/submit-contact";
import { getServiceSlugs } from "@/features/services/server/queries";
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
  });

  return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
