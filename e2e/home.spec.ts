import { expect, test } from "@playwright/test";

test("la page d'accueil affiche le pitch Factura", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Factura/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Factura/);
  await expect(page.getByText(/Réforme 2026/i)).toBeVisible();
  await expect(page.getByText(/9\s?€\/mois/)).toBeVisible();
});

test("le formulaire de liste d'attente est visible et bloque les emails invalides côté UI", async ({
  page,
}) => {
  await page.goto("/");

  const emailInput = page.getByPlaceholder("vous@exemple.fr");
  const submit = page.getByRole("button", { name: /me prévenir/i });

  await expect(emailInput).toBeVisible();
  await expect(submit).toBeEnabled();

  // Le navigateur bloque la soumission via la validation HTML required + type=email.
  // On vérifie que le formulaire n'est pas soumis (le bouton reste activé, pas d'état succès).
  await emailInput.fill("not-an-email");
  await submit.click();

  await expect(page.getByText(/merci, vous êtes inscrit/i)).toHaveCount(0);
});
