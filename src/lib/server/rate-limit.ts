import "server-only";
import { createHash } from "node:crypto";
import type { ServerEnv } from "./env";

export type RateLimitResult = { allowed: boolean };

export interface RateLimiter {
  readonly name: string;
  limit(key: string): Promise<RateLimitResult>;
}

export const CONTACT_RATE_LIMIT = { max: 5, windowSeconds: 600 } as const;

/**
 * Janela fixa em memória. Serve para desenvolvimento e para um único servidor;
 * em serverless cada instância tem a própria memória, então não é um limite global.
 */
export function createMemoryRateLimiter(
  max: number = CONTACT_RATE_LIMIT.max,
  windowSeconds: number = CONTACT_RATE_LIMIT.windowSeconds,
  now: () => number = Date.now,
): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    name: "memory",
    async limit(key) {
      const current = now();
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= current) {
        hits.set(key, { count: 1, resetAt: current + windowSeconds * 1000 });
        return { allowed: true };
      }
      entry.count += 1;
      return { allowed: entry.count <= max };
    },
  };
}

/** Limite global com Upstash Redis via REST (INCR + EXPIRE), sem SDK. */
export function createUpstashRateLimiter(
  url: string,
  token: string,
  max: number = CONTACT_RATE_LIMIT.max,
  windowSeconds: number = CONTACT_RATE_LIMIT.windowSeconds,
  fetchImpl: typeof fetch = fetch,
): RateLimiter {
  return {
    name: "upstash",
    async limit(key) {
      const redisKey = `contact:rl:${key}`;
      const response = await fetchImpl(`${url.replace(/\/+$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, String(windowSeconds), "NX"],
        ]),
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) throw new Error(`Upstash respondeu HTTP ${response.status}.`);
      const [incr] = (await response.json()) as [{ result: number }];
      return { allowed: incr.result <= max };
    },
  };
}

let memoryLimiter: RateLimiter | null = null;

export function getRateLimiter(env: ServerEnv): RateLimiter {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashRateLimiter(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN);
  }
  memoryLimiter ??= createMemoryRateLimiter();
  return memoryLimiter;
}

/**
 * Identifica o cliente pelo IP informado pelo proxy da hospedagem. O IP vira um hash
 * para não ser armazenado em texto puro no limitador.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
