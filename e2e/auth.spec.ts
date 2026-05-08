import { expect, test } from "@playwright/test";

test("/account non authentifié redirige vers /login avec ?next=/account", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
});

test("la page /login affiche le formulaire magic link", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
  await expect(page.getByLabel(/adresse email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /recevoir un lien/i })).toBeEnabled();
});

test("/auth/error affiche un message contextualisé selon la raison", async ({ page }) => {
  await page.goto("/auth/error?reason=exchange_failed");
  await expect(page.getByText(/lien expiré/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /demander un nouveau lien/i })).toBeVisible();
});
