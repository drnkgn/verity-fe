import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright e2e specs/fixtures aren't React code — the
    // react-hooks plugin's naming heuristic misfires on Playwright's
    // `use` fixture parameter (its `{ page, use }` destructuring looks
    // like a custom hook call to the rule). Playwright's own tsconfig
    // + `npx playwright test` type-checks these separately.
    "e2e/**",
    "playwright.config.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
