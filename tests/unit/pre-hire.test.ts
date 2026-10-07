import { describe, expect, it } from "vitest";
import { buildCheckoutPayload, createOrderId } from "@/features/packages/checkout";
import { getPackages } from "@/features/packages/packages";
import { createPreHireSchema, toPreHireErrors } from "@/features/packages/schemas/pre-hire-schema";
import { submitPreHire } from "@/features/packages/server/submit-pre-hire";
import { createTestAdapter } from "@/lib/server/email";
import { createMemoryRateLimiter } from "@/lib/server/rate-limit";
import { formatBrazilPhone, isValidBrazilPhone, toE164 } from "@/lib/phone";

describe("telefone brasileiro", () => {
  it("aplica a máscara enquanto a pessoa digita", () => {
    expect(formatBrazilPhone("11")).toBe("(11");
    expect(formatBrazilPhone("119876")).toBe("(11) 9876");
    expect(formatBrazilPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatBrazilPhone("1134567890")).toBe("(11) 3456-7890");
    expect(formatBrazilPhone("+55 11 98765-4321 999")).toBe("(11) 98765-4321");
  });

  it("valida celular e fixo com DDD e converte para E.164", () => {
    expect(isValidBrazilPhone("(11) 98765-4321")).toBe(true);
    expect(isValidBrazilPhone("(11) 3456-7890")).toBe(true);
    expect(isValidBrazilPhone("(11) 8765-432")).toBe(false);
    expect(isValidBrazilPhone("(05) 98765-4321")).toBe(false);
    expect(isValidBrazilPhone("(11) 88765-4321")).toBe(false);
    expect(toE164("(11) 98765-4321")).toBe("+5511987654321");
  });
});

const ids = getPackages("pt-BR").map((item) => item.id);
const valid = {
  packageId: "diagnostico-tecnico",
  name: "Maria Souza",
  email: "maria@example.com",
  whatsapp: "(11) 98765-4321",
  message: "Preciso revisar a performance do meu site.",
  locale: "pt-BR",
};

describe("validação da pré-contratação", () => {
  const schema = createPreHireSchema(ids);

  it("aceita os dados completos", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("exige nome e sobrenome, e-mail, WhatsApp e mensagem", () => {
    const result = schema.safeParse({ ...valid, name: "Maria", email: "x", whatsapp: "123", message: "oi" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toPreHireErrors(result.error)).toEqual({ name: "name", email: "email", whatsapp: "whatsapp", message: "message" });
  });

  it("rejeita pacote inexistente", () => {
    expect(schema.safeParse({ ...valid, packageId: "pacote-falso" }).success).toBe(false);
  });
});

describe("pedido para o pagamento", () => {
  it("usa o valor do servidor em centavos e o telefone em E.164", () => {
    const item = getPackages("pt-BR").find((p) => p.id === "diagnostico-tecnico")!;
    const now = new Date("2026-10-07T12:00:00Z");
    const checkout = buildCheckoutPayload({ ...valid, locale: "pt-BR" }, item, now, "RA-TESTE-001");
    expect(checkout).toMatchObject({
      orderId: "RA-TESTE-001",
      createdAt: "2026-10-07T12:00:00.000Z",
      package: { id: "diagnostico-tecnico", amountInCents: item.price! * 100, currency: "BRL", installments: true },
      customer: { name: "Maria Souza", email: "maria@example.com", phone: "+5511987654321" },
    });
  });

  it("gera números de pedido legíveis", () => {
    expect(createOrderId(new Date("2026-10-07T12:00:00Z"), () => 0.5)).toMatch(/^RA-[0-9A-Z]{6}-[0-9A-Z]{3}$/);
  });
});

describe("endpoint de pré-contratação", () => {
  const deps = () => ({
    email: createTestAdapter(),
    limiter: createMemoryRateLimiter(5, 600),
    to: "renan@example.com",
    payments: null,
    appUrl: "https://example.com",
  });

  it("responde 200 com o pedido e avisa o Renan por e-mail", async () => {
    const d = deps();
    const result = await submitPreHire(valid, "ip", d);
    expect(result.status).toBe(200);
    expect(result.body.ok && result.body.checkout.package.id).toBe("diagnostico-tecnico");
    expect(d.email.outbox[0].subject).toContain("Pré-contratação");
    expect(d.email.outbox[0].replyTo).toBe("maria@example.com");
  });

  it("ignora preço enviado pelo navegador", async () => {
    const result = await submitPreHire({ ...valid, price: 1, amountInCents: 100 }, "ip", deps());
    const expected = getPackages("pt-BR").find((p) => p.id === "diagnostico-tecnico")!.price! * 100;
    expect(result.body.ok && result.body.checkout.package.amountInCents).toBe(expected);
  });

  it("responde 400, 429 e 503 nos casos de erro", async () => {
    expect((await submitPreHire({ ...valid, email: "x" }, "ip", deps())).status).toBe(400);
    const limited = { ...deps(), limiter: createMemoryRateLimiter(1, 600) };
    await submitPreHire(valid, "ip", limited);
    expect((await submitPreHire(valid, "ip", limited)).status).toBe(429);
    expect((await submitPreHire(valid, "ip", { ...deps(), email: null })).status).toBe(503);
  });
});
