import { describe, it, expect } from "vitest";
import { quoteDraftSchema } from "./schemas";

const base = { category: "services", lines: [] };

describe("quoteDraftSchema", () => {
  it("accepte un brouillon minimal", () => {
    expect(quoteDraftSchema.safeParse(base).success).toBe(true);
  });

  it("met currency à EUR par défaut", () => {
    expect(quoteDraftSchema.parse(base).currency).toBe("EUR");
  });

  it("transforme validUntil vide en null", () => {
    expect(
      quoteDraftSchema.parse({ ...base, validUntil: "" }).validUntil,
    ).toBeNull();
  });

  it("rejette une catégorie inconnue", () => {
    expect(
      quoteDraftSchema.safeParse({ ...base, category: "autre" }).success,
    ).toBe(false);
  });

  it("valide une ligne complète", () => {
    const r = quoteDraftSchema.safeParse({
      ...base,
      lines: [
        {
          description: "Audit",
          quantity: 2,
          unitPrice: 400,
          vatRate: 20,
          unitCode: "DAY",
          vatCategory: "S",
        },
      ],
    });
    expect(r.success).toBe(true);
  });
});
