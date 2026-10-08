import { afterEach, describe, expect, it, vi } from "vitest";
import { getLeadAdapter, createLead } from "@/lib/server/leads";
import { submitContact } from "@/features/contact/server/submit-contact";
import { createTestAdapter, EmailProviderError } from "@/lib/server/email";
import { createMemoryRateLimiter } from "@/lib/server/rate-limit";

const input = { name: "Test User", email: "test@example.com", service: "automacao-ia", message: "Quero automatizar os pedidos recebidos pelo site.", company: undefined, phone: undefined, timeline: undefined };
const deps = () => ({ email: createTestAdapter(), limiter: createMemoryRateLimiter(), serviceSlugs: ["automacao-ia"], to: "owner@example.com" });
afterEach(() => vi.restoreAllMocks());

describe("lead delivery", () => {
  it("emails and forwards the same lead ID, without the honeypot", async () => {
    const d = deps();
    const send = vi.fn().mockResolvedValue(undefined);
    expect((await submitContact({ ...input, website: "" }, "ip", { ...d, leads: { send } })).status).toBe(200);
    const lead = send.mock.calls[0][0];
    expect(lead).toMatchObject({ version: 1, event: "lead.created", status: "new", contact: { email: input.email } });
    expect(lead.contact).not.toHaveProperty("website");
    expect(d.email.outbox[0].text).toContain(lead.id);
  });
  it("webhook failure preserves accepted email and logs only the recovery ID", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const d = deps();
    const send = vi.fn().mockRejectedValue(new Error("secret-token test@example.com"));
    expect((await submitContact(input, "ip", { ...d, leads: { send } })).status).toBe(200);
    expect(d.email.outbox).toHaveLength(1);
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/secret-token|test@example.com/);
  });
  it("does not forward invalid, rate-limited or email-rejected contacts", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi.fn();
    const d = { ...deps(), leads: { send } };
    expect((await submitContact({ ...input, email: "bad" }, "ip", d)).status).toBe(400);
    expect((await submitContact(input, "ip", { ...d, limiter: { name: "deny", limit: async () => ({ allowed: false }) } })).status).toBe(429);
    expect((await submitContact(input, "ip", { ...d, email: { name: "fail", send: async () => { throw new EmailProviderError(500); } } })).status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
  it("uses authenticated HTTPS, a stable idempotency key, timeout and rejects redirects", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    const adapter = getLeadAdapter({ LEADS_WEBHOOK_URL: "https://crm.example.com/lead", LEADS_WEBHOOK_TOKEN: "test-secret" }, request)!;
    const lead = createLead(input);
    await adapter.send(lead);
    expect(request).toHaveBeenCalledWith(new URL("https://crm.example.com/lead"), expect.objectContaining({
      method: "POST", redirect: "error", headers: expect.objectContaining({ Authorization: "Bearer test-secret", "Idempotency-Key": lead.id }),
    }));
    request.mockResolvedValue(new Response(null, { status: 500 }));
    await expect(adapter.send(lead)).rejects.toThrow("HTTP 500");
  });
  it("is off without configuration and rejects unsafe or incomplete configuration", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(getLeadAdapter({})).toBeNull();
    expect(getLeadAdapter({ LEADS_WEBHOOK_URL: "http://crm.example.com", LEADS_WEBHOOK_TOKEN: "secret" })).toBeNull();
    expect(getLeadAdapter({ LEADS_WEBHOOK_URL: "https://crm.example.com" })).toBeNull();
  });
});
