import Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { buildCheckoutPayload } from "@/features/packages/checkout";
import { getPackages } from "@/features/packages/packages";
import { createMemoryOrderStore } from "@/features/packages/server/order-store";
import {
  buildCheckoutSessionParams,
  checkoutUrls,
  isCheckoutSessionId,
  orderFromSession,
  type PaymentGateway,
} from "@/features/packages/server/payments";
import { processStripeWebhook } from "@/features/packages/server/stripe-webhook";
import { submitPreHire } from "@/features/packages/server/submit-pre-hire";
import { createTestAdapter } from "@/lib/server/email";
import { createMemoryRateLimiter } from "@/lib/server/rate-limit";

const input = {
  packageId: "diagnostico-tecnico",
  name: "Maria Souza",
  email: "maria@example.com",
  whatsapp: "(11) 98765-4321",
  message: "Quero melhorar a performance do meu site.",
  locale: "pt-BR" as const,
};
const pkg = (id: string) => getPackages("pt-BR").find((item) => item.id === id)!;
const order = (id = "diagnostico-tecnico") => buildCheckoutPayload({ ...input, packageId: id }, pkg(id), new Date("2026-10-07T12:00:00Z"), "RA-TESTE1-ABC");
const urls = checkoutUrls("https://www.renanaugusto.com.br/", "pt-BR", "RA-TESTE1-ABC");

describe("sessão do Stripe Checkout", () => {
  it("cobra o valor do servidor em centavos, com Pix, boleto e cartão", () => {
    const params = buildCheckoutSessionParams(order(), urls);
    expect(params.mode).toBe("payment");
    expect(params.line_items?.[0].price_data?.unit_amount).toBe(190000);
    expect(params.line_items?.[0].price_data?.currency).toBe("brl");
    expect(params.allowed_payment_method_types).toEqual(["card", "pix", "boleto"]);
    expect(params.customer_email).toBe("maria@example.com");
    expect(params.metadata).toMatchObject({ order_id: "RA-TESTE1-ABC", customer_name: "Maria Souza", customer_whatsapp: "+5511987654321" });
    expect(params.payment_intent_data?.metadata?.order_id).toBe("RA-TESTE1-ABC");
  });

  it("monta as URLs de retorno com o id da sessão e o pedido", () => {
    expect(urls.success).toBe(
      "https://www.renanaugusto.com.br/pt-BR/contratar/sucesso?session_id={CHECKOUT_SESSION_ID}&order_id=RA-TESTE1-ABC",
    );
    expect(urls.cancel).toBe("https://www.renanaugusto.com.br/pt-BR/contratar?cancelado=1");
  });

  it("transforma o suporte mensal em assinatura só no cartão", () => {
    const params = buildCheckoutSessionParams(order("suporte-mensal"), urls);
    expect(params.mode).toBe("subscription");
    expect(params.line_items?.[0].price_data?.recurring).toEqual({ interval: "month" });
    expect(params.allowed_payment_method_types).toEqual(["card"]);
    expect(params.subscription_data?.metadata?.order_id).toBe("RA-TESTE1-ABC");
    expect(params.payment_intent_data).toBeUndefined();
  });

  it("liga o parcelamento só quando configurado e corta textos longos da metadata", () => {
    const long = { ...order(), message: "x".repeat(1500) };
    const params = buildCheckoutSessionParams(long, urls, { paymentMethods: ["card"], installments: true });
    expect(params.payment_method_options?.card?.installments?.enabled).toBe(true);
    expect(String(params.metadata?.message).length).toBe(500);
  });

  it("aceita só ids de sessão no formato do Stripe", () => {
    expect(isCheckoutSessionId("cs_test_a1B2c3D4e5F6g7")).toBe(true);
    expect(isCheckoutSessionId("cs_test_../../x")).toBe(false);
    expect(isCheckoutSessionId("pi_123")).toBe(false);
  });
});

const fakeGateway = (behavior: "ok" | "fail"): PaymentGateway & { calls: number } => ({
  name: "fake",
  calls: 0,
  async createCheckout(checkout) {
    this.calls += 1;
    if (behavior === "fail") throw new Error("Stripe fora do ar");
    return { id: "cs_test_fake123456", url: `https://checkout.stripe.com/c/pay/${checkout.orderId}` };
  },
  async retrieveOrder() {
    return null;
  },
});

describe("pré-contratação com pagamento", () => {
  const deps = (payments: PaymentGateway | null, email = createTestAdapter()) => ({
    email,
    limiter: createMemoryRateLimiter(5, 600),
    to: "renan@example.com",
    payments,
    appUrl: "https://example.com",
  });
  const body = { ...input, website: "" };

  it("devolve a URL do checkout e avisa o Renan com a sessão", async () => {
    const d = deps(fakeGateway("ok"));
    const result = await submitPreHire(body, "ip", d);
    expect(result.status).toBe(200);
    expect(result.body.ok && result.body.checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    expect(d.email!.outbox[0].text).toContain("cs_test_fake123456");
  });

  it("se o Stripe falhar, registra o pedido e cai no WhatsApp (checkoutUrl null)", async () => {
    const d = deps(fakeGateway("fail"));
    const result = await submitPreHire(body, "ip", d);
    expect(result.status).toBe(200);
    expect(result.body.ok && result.body.checkoutUrl).toBeNull();
    expect(d.email!.outbox[0].text).toContain("FALHOU");
  });

  it("segue para o pagamento mesmo sem e-mail, mas sem nenhum dos dois responde 503", async () => {
    const onlyStripe = await submitPreHire(body, "ip", { ...deps(fakeGateway("ok")), email: null });
    expect(onlyStripe.status).toBe(200);
    const nothing = await submitPreHire(body, "ip", { ...deps(fakeGateway("fail")), email: null });
    expect(nothing.status).toBe(503);
  });
});

const SECRET = "whsec_teste";

function session(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_test_abcdef123456",
    object: "checkout.session",
    amount_total: 190000,
    currency: "brl",
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    customer_email: "maria@example.com",
    customer_details: null,
    metadata: {
      order_id: "RA-TESTE1-ABC",
      package_id: "diagnostico-tecnico",
      package_name: "Diagnóstico Técnico",
      customer_name: "Maria Souza",
      customer_whatsapp: "+5511987654321",
      locale: "pt-BR",
    },
    ...overrides,
  } as Stripe.Checkout.Session;
}

function signed(type: string, object: Stripe.Checkout.Session) {
  const payload = JSON.stringify({ id: `evt_${Math.random()}`, object: "event", type, data: { object } });
  return { payload, signature: Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET }) };
}

describe("webhook do Stripe", () => {
  const deps = () => ({
    email: createTestAdapter(),
    store: createMemoryOrderStore(),
    to: "renan@example.com",
    schedulingUrl: "https://cal.com/renan/kickoff",
    whatsappNumber: "5511965781243",
  });

  it("recusa assinatura inválida ou ausente", async () => {
    const { payload } = signed("checkout.session.completed", session());
    expect((await processStripeWebhook(payload, "t=1,v1=errado", SECRET, deps())).status).toBe(400);
    expect((await processStripeWebhook(payload, null, SECRET, deps())).status).toBe(400);
    expect((await processStripeWebhook(payload, "x", undefined, deps())).status).toBe(503);
  });

  it("marca o pedido como pago e avisa o Renan e o cliente uma única vez", async () => {
    const d = deps();
    const { payload, signature } = signed("checkout.session.completed", session());
    expect((await processStripeWebhook(payload, signature, SECRET, d)).status).toBe(200);
    expect(await d.store.getStatus("RA-TESTE1-ABC")).toBe("paid");
    expect(d.email.outbox.map((message) => message.to)).toEqual(["renan@example.com", "maria@example.com"]);
    expect(d.email.outbox[1].subject).toBe("Pagamento confirmado: pedido RA-TESTE1-ABC");
    expect(d.email.outbox[1].text).toContain("https://cal.com/renan/kickoff");

    // O Stripe reenviou o mesmo evento: nada de e-mail duplicado.
    await processStripeWebhook(payload, signature, SECRET, d);
    expect(d.email.outbox).toHaveLength(2);
  });

  it("Pix/boleto: fica pendente e só vira pago no evento assíncrono", async () => {
    const d = deps();
    const pending = signed("checkout.session.completed", session({ payment_status: "unpaid" }));
    await processStripeWebhook(pending.payload, pending.signature, SECRET, d);
    expect(await d.store.getStatus("RA-TESTE1-ABC")).toBe("pending");
    expect(d.email.outbox).toHaveLength(1); // só o Renan

    const paid = signed("checkout.session.async_payment_succeeded", session());
    await processStripeWebhook(paid.payload, paid.signature, SECRET, d);
    expect(await d.store.getStatus("RA-TESTE1-ABC")).toBe("paid");
    expect(d.email.outbox.at(-1)?.to).toBe("maria@example.com");
  });

  it("ignora sessões que não vieram do site", async () => {
    const d = deps();
    const { payload, signature } = signed("checkout.session.completed", session({ metadata: {} }));
    expect((await processStripeWebhook(payload, signature, SECRET, d)).status).toBe(200);
    expect(d.email.outbox).toHaveLength(0);
  });

  it("converte a sessão no pedido do site", () => {
    expect(orderFromSession(session())).toMatchObject({ orderId: "RA-TESTE1-ABC", status: "paid", amountInCents: 190000, currency: "BRL" });
    expect(orderFromSession(session({ payment_status: "unpaid" }))?.status).toBe("pending");
  });
});
