import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/golden-path.json" }],
  ],
  use: {
    baseURL: process.env.PROTOTYPE_URL || "http://localhost:3104",
    viewport: { width: 1440, height: 1000 },
    browserName: "chromium",
    headless: true,
    screenshot: "off",
    video: "off",
    trace: "off",
  },
  webServer: process.env.PROTOTYPE_URL
    ? undefined
    : {
        command: "npm run start -- --port 3104",
        url: "http://localhost:3104",
        reuseExistingServer: false,
      },
});
