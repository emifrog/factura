import { describe, it, expect } from "vitest";
import { invoiceDraftSchema } from "./schemas";

describe("invoiceDraftSchema", () => {
  it("applique les défauts (EUR, TVA débits off, livraison nulle)", () => {
    const r = invoiceDraftSchema.parse({ category: "services", lines: [] });
    expect(r.currency).toBe("EUR");
    expect(r.vatOnDebits).toBe(false);
    expect(r.delivery).toBeNull();
    expect(r.clientId).toBeNull();
    expect(r.dueDate).toBeNull();
  });

  it("exige une catégorie d'opération valide", () => {
    expect(invoiceDraftSchema.safeParse({ lines: [] }).success).toBe(false);
    expect(
      invoiceDraftSchema.safeParse({ category: "autre", lines: [] }).success,
    ).toBe(false);
  });

  it("garde l'adresse de livraison renseignée et défaut pays FR", () => {
    const r = invoiceDraftSchema.parse({
      category: "goods",
      lines: [],
      delivery: { line1: "2 avenue des Tilleuls", city: "Lyon", postalCode: "69003" },
    });
    expect(r.delivery).toMatchObject({
      line1: "2 avenue des Tilleuls",
      city: "Lyon",
      postalCode: "69003",
      country: "FR",
    });
  });

  it("ignore une adresse de livraison sans rue/ville/code postal", () => {
    const r = invoiceDraftSchema.parse({
      category: "services",
      lines: [],
      delivery: { line2: "Bâtiment A" },
    });
    expect(r.delivery).toBeNull();
  });

  it("préserve le pays de livraison fourni", () => {
    const r = invoiceDraftSchema.parse({
      category: "services",
      lines: [],
      delivery: { line1: "1 High Street", city: "London", country: "GB" },
    });
    expect(r.delivery?.country).toBe("GB");
  });
});
