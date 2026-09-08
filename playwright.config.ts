import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config.
 *
 * Defaults to testing a production build (`next build && next start`):
 * `next dev`'s Turbopack on-demand/lazy route compilation means the first
 * navigation to a not-yet-compiled route can take long enough to blow past
 * click/navigation assertion timeouts under parallel workers — that's
 * dev-server compile latency, not an app bug, but it makes dev mode flaky
 * for e2e. Set PW_USE_DEV=1 to run against `next dev` instead for faster
 * local iteration when only re-running a couple of specs.
 */
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
const useDevServer = process.env.PW_USE_DEV === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Capped rather than left to Playwright's default (CPU core count).
  // Spinning up many Chromium contexts at once against a single local dev
  // server is a common source of "browserContext.newPage timeout" flakes
  // on modest machines — 4 is a safer default for `npm run test:e2e`
  // without needing a manual --workers flag.
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? "line" : "html",
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: useDevServer
      ? `npm run dev -- -p ${PORT}`
      : `npm run build && npm run start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
