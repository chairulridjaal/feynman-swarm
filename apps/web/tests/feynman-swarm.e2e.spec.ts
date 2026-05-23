import { expect, test } from "@playwright/test";

test("runs the deterministic research economy flow end to end", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Create Mission Contract|Initialize Swarm Mission/ }).click();
  await page.getByRole("button", { name: "Use Sandbox Wallet" }).click();
  await page.getByRole("button", { name: "Fund Mission with 24 XLM" }).click();

  await expect(page.getByText("Funded - ready to start")).toBeVisible();
  await page.getByRole("button", { name: "Start Swarm Operations" }).click();

  await expect(page.getByRole("heading", { name: "Evidence board" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("21.4 XLM")).toBeVisible();

  await page.getByRole("button", { name: "Run Verifier" }).click();

  await expect(page.getByRole("heading", { name: "Research invoice." })).toBeVisible();
  await expect(page.getByText("24.0 XLM")).toBeVisible();
  await expect(page.getByText("16.1 XLM")).toBeVisible();
  await expect(page.getByText("7.9 XLM")).toBeVisible();
  await expect(page.getByText("Accepted artifacts")).toBeVisible();
  await expect(page.getByText("Rejected artifacts")).toBeVisible();

  await page.getByRole("button", { name: "Trigger Settlement Refund" }).click();
  await expect(page.getByText("Refund processed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Trigger Settlement Refund" })).toHaveCount(0);

  await page.getByRole("button", { name: /Final report/ }).click();
  await expect(page.getByRole("heading", { name: "Final report" })).toBeVisible();
  await expect(page.getByText("Total budget allocated:")).toBeVisible();
  await expect(page.getByText("Accepted artifacts earned")).toBeVisible();
  await expect(page.getByText("Rejected claims")).toBeVisible();
});
