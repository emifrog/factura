import { expect, test } from "@playwright/test";

test("la page d'accueil affiche le pitch Factura", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Factura/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Factura/);
  await expect(page.getByText(/Réforme 2026/i)).toBeVisible();
  await expect(page.getByText(/9\s?€\/mois/)).toBeVisible();
});
