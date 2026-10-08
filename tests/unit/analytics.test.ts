import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

function storage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) };
}

// Warm the module transform so the first test does not pay the cold import cost.
beforeAll(async () => { await import("@/lib/analytics"); }, 30_000);

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
  vi.stubGlobal("localStorage", storage());
  vi.stubGlobal("sessionStorage", storage());
  vi.stubGlobal("document", { referrer: "https://google.com/search?q=private", cookie: "" });
  vi.stubGlobal("window", {
    location: { href: "https://example.com/pt-BR?utm_source=linkedin&email=private@example.com", pathname: "/pt-BR", origin: "https://example.com", reload: vi.fn() },
    dispatchEvent: vi.fn(),
  });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("analytics consent", () => {
  it("does not collect attribution when GA configuration is removed", async () => {
    const analytics = await import("@/lib/analytics");
    analytics.setConsent("granted");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    expect(analytics.getAcquisition()).toBeUndefined();
  });
  it("collects nothing before consent and after refusal", async () => {
    const analytics = await import("@/lib/analytics");
    analytics.initializeAnalytics("G-TEST123");
    analytics.trackEvent("generate_lead");
    expect(window.dataLayer).toBeUndefined();
    expect(analytics.getAcquisition()).toBeUndefined();
    analytics.setConsent("denied");
    analytics.initializeAnalytics("G-TEST123");
    expect(window.dataLayer).toBeUndefined();
  });
  it("initializes once and emits only explicit, sanitized events", async () => {
    const analytics = await import("@/lib/analytics");
    analytics.setConsent("granted");
    analytics.initializeAnalytics("G-TEST123");
    analytics.initializeAnalytics("G-TEST123");
    analytics.trackEvent("generate_lead", { service: "automacao-ia" });
    // gtag.js ignores plain arrays, so commands must be pushed as `arguments` objects.
    expect(window.dataLayer!.every((entry) => Object.prototype.toString.call(entry) === "[object Arguments]")).toBe(true);
    const commands = window.dataLayer as unknown[][];
    expect(commands.filter((entry) => entry[0] === "config")).toHaveLength(1);
    expect(commands.find((entry) => entry[0] === "config")?.[2]).toMatchObject({ send_page_view: false, allow_google_signals: false });
    expect(commands.find((entry) => entry[1] === "generate_lead")?.[2]).toMatchObject({ service: "automacao-ia", campaign_source: "linkedin", page_location: "https://example.com/pt-BR", page_referrer: "https://google.com/" });
    expect(JSON.stringify(commands)).not.toMatch(/private|\?utm_/);
  });
  it("keeps first session attribution across navigation and clears it on withdrawal", async () => {
    const analytics = await import("@/lib/analytics");
    analytics.setConsent("granted");
    const initial = analytics.getAcquisition();
    window.location.href = "https://example.com/pt-BR/contato?utm_source=other";
    expect(analytics.getAcquisition()).toEqual(initial);
    analytics.initializeAnalytics("G-TEST123");
    const count = window.dataLayer!.length;
    analytics.withdrawAnalytics();
    analytics.trackEvent("generate_lead");
    expect(window.dataLayer).toHaveLength(count);
    expect(analytics.getAcquisition()).toBeUndefined();
    expect(sessionStorage.getItem("portfolio-acquisition-v1")).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();
  });
  it("storage restrictions do not throw or break contact tracking calls", async () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
    vi.stubGlobal("sessionStorage", { getItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } });
    const analytics = await import("@/lib/analytics");
    expect(() => { analytics.setConsent("granted"); analytics.initializeAnalytics("G-TEST123"); analytics.trackEvent("page_view"); }).not.toThrow();
    expect(analytics.getAcquisition()).toBeUndefined();
    expect(() => analytics.setConsent("denied")).not.toThrow();
  });
});
