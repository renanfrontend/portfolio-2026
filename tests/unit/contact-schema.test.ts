import { describe, expect, it } from "vitest";
import { createContactSchema, toFieldErrors } from "@/features/contact/schemas/contact-schema";

const schema = createContactSchema(["desenvolvimento-web", "automacao-ia"]);

const valid = {
  name: "Maria Silva",
  email: "maria@example.com",
  service: "automacao-ia",
  message: "Preciso automatizar a triagem de pedidos que hoje é manual.",
};

function errorsFor(input: unknown) {
  const result = schema.safeParse(input);
  return result.success ? {} : toFieldErrors(result.error);
}

describe("contrato do formulário de contato", () => {
  it("aceita os campos obrigatórios e converte opcionais vazios em undefined", () => {
    const result = schema.parse({ ...valid, company: "", phone: "  ", budget: "", timeline: "" });
    expect(result).toMatchObject({ name: "Maria Silva", service: "automacao-ia" });
    expect(result.company).toBeUndefined();
    expect(result.budget).toBeUndefined();
  });

  it("aceita o assunto genérico (vagas e afins)", () => {
    expect(schema.safeParse({ ...valid, service: "outro" }).success).toBe(true);
  });

  it("retorna um código de erro por campo inválido", () => {
    expect(errorsFor({ ...valid, name: "M", email: "invalido", message: "curta" })).toEqual({
      name: "name",
      email: "email",
      message: "message",
    });
  });

  it("marca campos ausentes", () => {
    const errors = errorsFor({});
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "service"]);
  });

  it("rejeita serviço inexistente e faixa de orçamento desconhecida", () => {
    expect(errorsFor({ ...valid, service: "hacking" })).toEqual({ service: "service" });
    expect(schema.safeParse({ ...valid, budget: "1-milhao" }).success).toBe(false);
  });

  it("aplica limites de tamanho", () => {
    expect(errorsFor({ ...valid, message: "a".repeat(4001) })).toEqual({ message: "message" });
    expect(errorsFor({ ...valid, company: "a".repeat(121) })).toEqual({ company: "tooLong" });
  });

  it("rejeita a armadilha para robôs preenchida", () => {
    expect(schema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
});
