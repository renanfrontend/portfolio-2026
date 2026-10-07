import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMessage, submitContact, type SubmitContactDeps } from "@/features/contact/server/submit-contact";
import { createTestAdapter, EmailProviderError, type EmailAdapter } from "@/lib/server/email";
import { createMemoryRateLimiter, type RateLimiter } from "@/lib/server/rate-limit";

const payload = {
  name: "João",
  email: "joao@example.com",
  service: "desenvolvimento-web",
  message: "Quero um novo site institucional para a minha empresa.",
};

function deps(overrides: Partial<SubmitContactDeps> = {}): SubmitContactDeps {
  return {
    email: createTestAdapter(),
    limiter: createMemoryRateLimiter(5, 600),
    serviceSlugs: ["desenvolvimento-web"],
    to: "destino@example.com",
    ...overrides,
  };
}

afterEach(() => vi.restoreAllMocks());

describe("submitContact", () => {
  it("responde 200 somente depois de o provedor aceitar a mensagem", async () => {
    const email = createTestAdapter();
    const result = await submitContact(payload, "ip", deps({ email }));
    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(email.outbox).toHaveLength(1);
    expect(email.outbox[0]).toMatchObject({ to: "destino@example.com", replyTo: "joao@example.com" });
    expect(email.outbox[0].text).toContain(payload.message);
  });

  it("responde 400 com erros por campo e não envia nada", async () => {
    const email = createTestAdapter();
    const result = await submitContact({ ...payload, email: "x" }, "ip", deps({ email }));
    expect(result.status).toBe(400);
    expect(result.body).toEqual({ ok: false, error: "validation", fieldErrors: { email: "email" } });
    expect(email.outbox).toHaveLength(0);
  });

  it("responde 429 ao exceder o limite, sem afetar outra origem", async () => {
    const shared = deps({ limiter: createMemoryRateLimiter(2, 600) });
    await submitContact(payload, "ip", shared);
    await submitContact(payload, "ip", shared);
    const third = await submitContact(payload, "ip", shared);
    expect(third).toEqual({ status: 429, body: { ok: false, error: "rate_limited" } });
    expect((await submitContact(payload, "outro-ip", shared)).status).toBe(200);
  });

  it("responde 503 quando a integração de e-mail não está configurada", async () => {
    const result = await submitContact(payload, "ip", deps({ email: null }));
    expect(result).toEqual({ status: 503, body: { ok: false, error: "unavailable" } });
  });

  it("responde 503 quando o provedor recusa a mensagem", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failing: EmailAdapter = { name: "fail", send: () => Promise.reject(new EmailProviderError(500)) };
    const result = await submitContact(payload, "ip", deps({ email: failing }));
    expect(result).toEqual({ status: 503, body: { ok: false, error: "unavailable" } });
  });

  it("responde 500 genérico em falha inesperada, sem registrar dados pessoais", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing: EmailAdapter = { name: "boom", send: () => Promise.reject(new TypeError("joao@example.com")) };
    const result = await submitContact(payload, "ip", deps({ email: failing }));
    expect(result).toEqual({ status: 500, body: { ok: false, error: "server" } });
    expect(JSON.stringify(log.mock.calls)).not.toContain("joao@example.com");
  });

  it("responde 503 quando o limitador externo falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const broken: RateLimiter = { name: "broken", limit: () => Promise.reject(new Error("down")) };
    const result = await submitContact(payload, "ip", deps({ limiter: broken }));
    expect(result.status).toBe(503);
  });
});

describe("createMemoryRateLimiter", () => {
  it("libera de novo depois que a janela expira", async () => {
    let now = 0;
    const limiter = createMemoryRateLimiter(1, 10, () => now);
    expect(await limiter.limit("a")).toEqual({ allowed: true });
    expect(await limiter.limit("a")).toEqual({ allowed: false });
    now = 10_001;
    expect(await limiter.limit("a")).toEqual({ allowed: true });
  });
});

describe("buildMessage", () => {
  it("usa nomes legíveis para serviço e orçamento e informa o idioma da página", () => {
    const message = buildMessage(
      { name: "Ana", email: "ana@example.com", company: undefined, phone: undefined, timeline: undefined, service: "automacao-ia", budget: "5k-15k", message: "Quero automatizar a triagem de pedidos.", locale: "en" },
      "destino@example.com",
      { services: { "automacao-ia": "Automação com IA" }, budgets: { "5k-15k": "De R$ 5 mil a R$ 15 mil" } },
    );
    expect(message.subject).toBe("[Site] Automação com IA: contato de Ana");
    expect(message.text).toContain("Serviço: Automação com IA");
    expect(message.text).toContain("Orçamento: De R$ 5 mil a R$ 15 mil");
    expect(message.text).toContain("Idioma da página: Inglês");
    expect(message.replyTo).toBe("ana@example.com");
  });
});
