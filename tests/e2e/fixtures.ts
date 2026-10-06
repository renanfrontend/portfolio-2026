import { test as base, expect } from "@playwright/test";

/** Por padrão os testes pulam a abertura; o teste da própria abertura usa `withIntro`. */
export const test = base.extend<{ withIntro: boolean }>({
  withIntro: [false, { option: true }],
  page: async ({ page, withIntro }, provide) => {
    if (!withIntro) {
      await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
    }
    await provide(page);
  },
});

export { expect };
