import "server-only";
import { randomUUID } from "node:crypto";
import type { ContactInput } from "@/features/contact/schemas/contact-schema";

/** Pedido de pacote em /contratar: número, pacote, valor do servidor e como o pagamento seguiu. */
export type LeadOrder = {
  id: string;
  packageId: string;
  amountInCents: number | null;
  currency: "BRL";
  /** stripe = cliente foi ao Checkout; manual = pagamento combinado depois (WhatsApp/e-mail). */
  checkout: "stripe" | "manual";
};

export type Lead = {
  version: 1;
  event: "lead.created";
  id: string;
  createdAt: string;
  status: "new";
  contact: Omit<ContactInput, "website">;
  /** Só nos pedidos de pacote; campo novo e opcional, compatível com quem já consome o webhook. */
  order?: LeadOrder;
};
export interface LeadAdapter { send(lead: Lead): Promise<void> }

export function createLead(input: ContactInput, order?: LeadOrder): Lead {
  const { website: _honeypot, ...contact } = input;
  void _honeypot;
  return {
    version: 1,
    event: "lead.created",
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "new",
    contact,
    ...(order ? { order } : {}),
  };
}

/** Credentials are read independently so a bad webhook setting cannot disable email. */
export function getLeadAdapter(env: Record<string, string | undefined> = process.env, fetchImpl: typeof fetch = fetch): LeadAdapter | null {
  const rawUrl = env.LEADS_WEBHOOK_URL?.trim();
  const token = env.LEADS_WEBHOOK_TOKEN?.trim();
  if (!rawUrl && !token) return null;
  let url: URL;
  try {
    url = new URL(rawUrl ?? "");
    if (url.protocol !== "https:" || url.username || url.password || !token || /[\r\n]/.test(token)) throw new Error();
  } catch {
    console.error("[leads] Configure uma URL HTTPS e um token para habilitar a integração.");
    return null;
  }
  return {
    async send(lead) {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Idempotency-Key": lead.id },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(4_000),
        redirect: "error",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Webhook HTTP ${response.status}`);
    },
  };
}
