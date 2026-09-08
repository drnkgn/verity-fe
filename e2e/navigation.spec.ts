import { test, expect, ROUTES } from "./fixtures";

/**
 * Navigation tests — clicking the header nav links (and logo) moves between
 * routes, and the active link is visually/semantically distinguished.
 * Per DEMO-PLAN FE-1/FE-3: Contractor, Subcontractor always present;
 * Demo Control only present while advance_clock is in the loaded IDL
 * (hasDemoClockInstruction() — see lib/program.ts).
 *
 * Nav link locators are scoped to the header (role=banner) because the home
 * page's hero CTAs ("Start as Contractor" / "Start as Subcontractor") also
 * match a fuzzy name lookup for "Contractor"/"Subcontractor".
 */

test.describe("header navigation", () => {
  test("logo links back to the home page", async ({ page }) => {
    await page.goto(ROUTES.contractor);
    const header = page.getByRole("banner");
    await header.getByRole("link", { name: "Verita" }).click();
    await expect(page).toHaveURL(ROUTES.home);
  });

  test("Contractor nav link navigates to the contractor page", async ({
    page,
  }) => {
    await page.goto(ROUTES.home);
    const header = page.getByRole("banner");
    await header.getByRole("link", { name: "Contractor", exact: true }).click();
    await expect(page).toHaveURL(ROUTES.contractor);
    await expect(
      page.getByRole("heading", { name: "Main Contractor" })
    ).toBeVisible();
  });

  test("Subcontractor nav link navigates to the subcontractor page", async ({
    page,
  }) => {
    await page.goto(ROUTES.home);
    const header = page.getByRole("banner");
    await header
      .getByRole("link", { name: "Subcontractor", exact: true })
      .click();
    await expect(page).toHaveURL(ROUTES.subcontractor);
    await expect(
      page.getByRole("heading", { name: "Subcontractor" })
    ).toBeVisible();
  });

  test("Demo Control nav link navigates to the demo control page when advance_clock is available", async ({
    page,
  }) => {
    await page.goto(ROUTES.home);
    const header = page.getByRole("banner");
    const demoLink = header.getByRole("link", { name: "Demo Control" });
    await expect(demoLink).toBeVisible();
    await demoLink.click();
    await expect(page).toHaveURL(ROUTES.demoControl);
    await expect(
      page.getByRole("heading", { name: "Demo Control" })
    ).toBeVisible();
  });

  test("nav is present and consistent across all four routes", async ({
    page,
  }) => {
    for (const path of Object.values(ROUTES)) {
      await page.goto(path);
      const header = page.getByRole("banner");
      await expect(
        header.getByRole("link", { name: "Contractor", exact: true })
      ).toBeVisible();
      await expect(
        header.getByRole("link", { name: "Subcontractor", exact: true })
      ).toBeVisible();
    }
  });

  test("navigating between all four pages in sequence stays error-free", async ({
    page,
    consoleErrors,
  }) => {
    await page.goto(ROUTES.home);
    const header = page.getByRole("banner");

    await header.getByRole("link", { name: "Contractor", exact: true }).click();
    await expect(page).toHaveURL(ROUTES.contractor);

    await header
      .getByRole("link", { name: "Subcontractor", exact: true })
      .click();
    await expect(page).toHaveURL(ROUTES.subcontractor);

    await header.getByRole("link", { name: "Demo Control" }).click();
    await expect(page).toHaveURL(ROUTES.demoControl);

    await header.getByRole("link", { name: "Verita" }).click();
    await expect(page).toHaveURL(ROUTES.home);

    expect(consoleErrors()).toEqual([]);
  });
});
