import { getSchedulingUrl, getWhatsappNumber } from "@/config/contact";
import { getOrderStore } from "@/features/packages/server/order-store";
import { processStripeWebhook } from "@/features/packages/server/stripe-webhook";
import { getEmailAdapter } from "@/lib/server/email";
import { getServerEnv } from "@/lib/server/env";

/** Eventos do Stripe Checkout. A assinatura é conferida sobre o corpo bruto, sem parse prévio. */
export async function POST(request: Request) {
  const env = getServerEnv();
  const result = await processStripeWebhook(await request.text(), request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET, {
    email: getEmailAdapter(env),
    store: getOrderStore(env),
    to: env.contactTo,
    schedulingUrl: getSchedulingUrl(),
    whatsappNumber: getWhatsappNumber(),
  });
  return Response.json(result.body, { status: result.status });
}
