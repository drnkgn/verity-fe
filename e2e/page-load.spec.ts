import { test, expect, ROUTES, gotoAndWaitForShell } from "./fixtures";

/**
 * Page-load smoke tests: every route in the app nav responds 200 and renders
 * with no console errors or uncaught page errors. This is the regression
 * test for the WalletContext/hydration-mismatch bugs found and fixed while
 * building the M3 redesign (see AppHeader/WalletButton/AppRouterCacheProvider).
 */
for (const [name, path] of Object.entries(ROUTES)) {
  test(`${name} (${path}) loads with a 200 and no console/page errors`, async ({
    page,
    consoleErrors,
  }) => {
    const response = await gotoAndWaitForShell(page, path);

    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    expect(consoleErrors()).toEqual([]);
  });
}

test("home page renders the hero headline and role picker", async ({
  page,
}) => {
  await page.goto(ROUTES.home);

  await expect(
    page.getByRole("heading", {
      name: /retention funds, held where no one can quietly take them back/i,
    })
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: "Choose a role" })).toBeVisible();
});

test("404 for an unknown route returns a 404 status", async ({ page }) => {
  // A real 404 document response legitimately logs a
  // "Failed to load resource: ... 404" console error in Chromium — that's
  // expected browser behavior for the failed navigation request itself,
  // not an app bug, so this test only asserts the status code.
  const response = await page.goto("/this-route-does-not-exist");
  await page.waitForLoadState("networkidle");

  expect(response?.status()).toBe(404);
});
