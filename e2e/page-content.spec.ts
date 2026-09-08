import { test, expect, ROUTES } from "./fixtures";

/**
 * Home page content — hero, trust pillars, role picker cards.
 */
test.describe("home page content", () => {
  test("renders the three trust pillars", async ({ page }) => {
    await page.goto(ROUTES.home);

    await expect(
      page.getByRole("heading", { name: "Non-custodial by construction" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Unilateral backstop release" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Verify it yourself" })
    ).toBeVisible();
  });

  test("renders the three role cards with working Open links", async ({
    page,
  }) => {
    await page.goto(ROUTES.home);

    const contractorCard = page.getByRole("heading", { name: "Main Contractor" });
    const subcontractorCard = page.getByRole("heading", {
      name: "Subcontractor",
      exact: true,
    });
    const demoCard = page.getByRole("heading", { name: "Demo Control" });

    await expect(contractorCard).toBeVisible();
    await expect(subcontractorCard).toBeVisible();
    await expect(demoCard).toBeVisible();

    // Three "Open" links, one per role card.
    await expect(page.getByRole("link", { name: "Open" })).toHaveCount(3);
  });

  test("hero CTAs link to the correct role pages", async ({ page }) => {
    await page.goto(ROUTES.home);

    await expect(
      page.getByRole("link", { name: "Start as Contractor" })
    ).toHaveAttribute("href", ROUTES.contractor);
    await expect(
      page.getByRole("link", { name: "Start as Subcontractor" })
    ).toHaveAttribute("href", ROUTES.subcontractor);
  });
});

/**
 * Main Contractor page content — fund form fields, structural-refusal panel,
 * vault status card placeholder. Per API-CONTRACT §3 fund_vault / DEMO-PLAN FE-2.
 */
test.describe("contractor page content", () => {
  test("renders the fund vault form fields", async ({ page }) => {
    await page.goto(ROUTES.contractor);

    await expect(page.getByLabel("Amount (SOL)")).toBeVisible();
    await expect(page.getByLabel("Practical completion date")).toBeVisible();
    await expect(page.getByLabel("DLP days")).toBeVisible();
    await expect(page.getByLabel("Grace days")).toBeVisible();
    await expect(page.getByLabel("Release schedule (bps)")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Fund vault" })
    ).toBeVisible();
  });

  test("fund vault button is disabled until identity + wallet are set", async ({
    page,
  }) => {
    await page.goto(ROUTES.contractor);
    await expect(
      page.getByRole("button", { name: "Fund vault" })
    ).toBeDisabled();
  });

  test("renders the structural-refusal panel with a permanently disabled withdraw button", async ({
    page,
  }) => {
    await page.goto(ROUTES.contractor);

    await expect(
      page.getByRole("heading", { name: "Try to withdraw retention" })
    ).toBeVisible();
    await expect(
      page.getByText(
        "There is no withdrawal instruction for the main contractor"
      )
    ).toBeVisible();

    const withdrawButton = page.getByRole("button", {
      name: "Withdraw retention (no such instruction exists)",
    });
    await expect(withdrawButton).toBeVisible();
    await expect(withdrawButton).toBeDisabled();
  });

  test("shows the project/vault identity form", async ({ page }) => {
    await page.goto(ROUTES.contractor);
    await expect(
      page.getByText("Project / Vault Identity", { exact: true })
    ).toBeVisible();
  });
});

/**
 * Subcontractor page content — claim panel, wallet-connect prompt.
 * Per API-CONTRACT §3 claim_release / DEMO-PLAN FE-2.
 */
test.describe("subcontractor page content", () => {
  test("renders the claim release panel", async ({ page }) => {
    await page.goto(ROUTES.subcontractor);

    await expect(
      page.getByRole("heading", { name: "Claim release" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Claim release" })
    ).toBeVisible();
  });

  test("claim release button is disabled without a connected wallet", async ({
    page,
  }) => {
    await page.goto(ROUTES.subcontractor);
    await expect(
      page.getByRole("button", { name: "Claim release" })
    ).toBeDisabled();
  });

  test("prompts to connect the subcontractor wallet", async ({ page }) => {
    await page.goto(ROUTES.subcontractor);
    await expect(
      page.getByText("Connect the subcontractor wallet first.")
    ).toBeVisible();
  });
});

/**
 * Demo Control page content — visibility gating, advance-clock form.
 * Per API-CONTRACT §4 / DEMO-PLAN FE-3.
 *
 * NOTE: hasDemoClockInstruction() (src/lib/program.ts) checks a hardcoded
 * bundled TAHAN_IDL constant with no runtime toggle, so the "IDL doesn't
 * expose advance_clock -> Demo Control hides itself" branch can't be
 * exercised via e2e without rebuilding against a different IDL. Only the
 * currently-shipped state (advance_clock present) is covered here.
 */
test.describe("demo control page content", () => {
  test("renders when advance_clock is present in the loaded IDL", async ({
    page,
  }) => {
    await page.goto(ROUTES.demoControl);
    await expect(
      page.getByRole("heading", { name: "Demo Control" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Advance clock" })
    ).toBeVisible();
  });

  test("renders the advance-clock form and buttons", async ({ page }) => {
    await page.goto(ROUTES.demoControl);

    await expect(page.getByLabel("New clock_offset (seconds)")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Fill offset to reach backstop" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Advance clock" })
    ).toBeVisible();
  });

  test("advance clock button is disabled without a matching demo_authority wallet", async ({
    page,
  }) => {
    await page.goto(ROUTES.demoControl);
    await expect(
      page.getByRole("button", { name: "Advance clock" })
    ).toBeDisabled();
  });

  test("renders the reset-for-clean-re-run guidance", async ({ page }) => {
    await page.goto(ROUTES.demoControl);
    await expect(
      page.getByRole("heading", { name: "Reset for a clean re-run" })
    ).toBeVisible();
  });
});
