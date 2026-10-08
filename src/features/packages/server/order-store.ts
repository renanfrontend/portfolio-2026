import "server-only";
import type { ServerEnv } from "@/lib/server/env";
import type { OrderStatus } from "./payments";

/**
 * Status dos pedidos atualizado pelo webhook do Stripe. O Stripe continua sendo a fonte oficial
 * (painel e página de sucesso consultam a sessão); aqui fica o registro rápido que evita
 * avisos repetidos quando o Stripe reenvia o mesmo evento.
 */
export interface OrderStore {
  readonly name: string;
  getStatus(orderId: string): Promise<OrderStatus | null>;
  setStatus(orderId: string, status: OrderStatus): Promise<void>;
}

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 180;

/** Só para desenvolvimento e testes: cada instância serverless tem a própria memória. */
export function createMemoryOrderStore(): OrderStore {
  const orders = new Map<string, OrderStatus>();
  return {
    name: "memory",
    async getStatus(orderId) {
      return orders.get(orderId) ?? null;
    },
    async setStatus(orderId, status) {
      orders.set(orderId, status);
    },
  };
}

/** Upstash Redis via REST, o mesmo usado no limitador de requisições. */
export function createUpstashOrderStore(url: string, token: string, fetchImpl: typeof fetch = fetch): OrderStore {
  const command = async (args: string[]) => {
    const response = await fetchImpl(url.replace(/\/+$/, ""), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`Upstash respondeu HTTP ${response.status}.`);
    return ((await response.json()) as { result: unknown }).result;
  };
  return {
    name: "upstash",
    async getStatus(orderId) {
      const result = await command(["GET", `order:status:${orderId}`]);
      return result === "paid" || result === "pending" || result === "failed" ? result : null;
    },
    async setStatus(orderId, status) {
      await command(["SET", `order:status:${orderId}`, status, "EX", String(ORDER_TTL_SECONDS)]);
    },
  };
}

let memoryStore: OrderStore | null = null;

export function getOrderStore(env: ServerEnv): OrderStore {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashOrderStore(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN);
  }
  memoryStore ??= createMemoryOrderStore();
  return memoryStore;
}
