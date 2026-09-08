import { test as base, expect, type Page } from "@playwright/test";

/**
 * Shared test fixture that tracks console errors and uncaught page errors
 * for the duration of a test, so specs can assert "this page loaded clean"
 * without each spec wiring up its own listeners.
 *
 * Usage:
 *   test("loads clean", async ({ page, consoleErrors }) => {
 *     await page.goto("/");
 *     expect(consoleErrors()).toEqual([]);
 *   });
 */
export const test = base.extend<{ consoleErrors: () => string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    await use(() => errors);
  },
});

export { expect };

/** Routes exposed in the app nav, per SPECIFICATIONS.md / DEMO-PLAN FE-2/FE-3. */
export const ROUTES = {
  home: "/",
  contractor: "/contractor",
  subcontractor: "/subcontractor",
  demoControl: "/demo-control",
} as const;

/** Navigate and wait for the app shell (header) to be present. */
export async function gotoAndWaitForShell(page: Page, path: string) {
  const response = await page.goto(path);
  await page.getByRole("banner").waitFor({ state: "visible" });
  return response;
}
