import { getPaymentGateway } from "@/features/packages/server/payments";
import { submitPreHire } from "@/features/packages/server/submit-pre-hire";
import { getEmailAdapter } from "@/lib/server/email";
import { getServerEnv } from "@/lib/server/env";
import { getLeadAdapter } from "@/lib/server/leads";
import { clientKeyFromHeaders, getRateLimiter } from "@/lib/server/rate-limit";

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return Response.json({ ok: false, error: "validation", fieldErrors: {} }, { status: 413 });
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "validation", fieldErrors: {} }, { status: 400 });
  }

  const env = getServerEnv();
  const result = await submitPreHire(payload, clientKeyFromHeaders(request.headers), {
    email: getEmailAdapter(env),
    limiter: getRateLimiter(env),
    to: env.contactTo,
    payments: getPaymentGateway(env),
    appUrl: env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin,
    leads: getLeadAdapter(),
  });
  return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
