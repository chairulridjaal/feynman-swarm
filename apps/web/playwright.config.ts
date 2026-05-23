import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://127.0.0.1:5187",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"]
  },
  webServer: {
    command: "npm run dev -- --port 5187 --strictPort",
    url: "http://127.0.0.1:5187",
    reuseExistingServer: false,
    timeout: 30_000
  }
});
