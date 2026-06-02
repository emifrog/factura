import { describe, it, expect } from "vitest";
import { companySchema } from "./schemas";

const base = {
  legalName: "Mon Entreprise",
  legalForm: "micro",
  vatRegime: "franchise",
};

describe("companySchema", () => {
  it("accepte une entreprise minimale valide", () => {
    const r = companySchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("transforme un SIREN vide en null", () => {
    const r = companySchema.parse({ ...base, siren: "" });
    expect(r.siren).toBeNull();
  });

  it("strippe les espaces du SIREN et accepte 9 chiffres", () => {
    const r = companySchema.parse({ ...base, siren: "123 456 789" });
    expect(r.siren).toBe("123456789");
  });

  it("rejette un SIREN non numérique", () => {
    const r = companySchema.safeParse({ ...base, siren: "12345" });
    expect(r.success).toBe(false);
  });

  it("rejette une forme juridique inconnue", () => {
    const r = companySchema.safeParse({ ...base, legalForm: "SARL" });
    expect(r.success).toBe(false);
  });

  it("coerce la case TVA sur les débits", () => {
    expect(
      companySchema.parse({ ...base, vatOnDebits: "on" }).vatOnDebits,
    ).toBe(true);
    expect(companySchema.parse({ ...base }).vatOnDebits).toBe(false);
  });

  it("normalise l'IBAN (espaces retirés, majuscules)", () => {
    const r = companySchema.parse({
      ...base,
      iban: "fr76 3000 6000 0112 3456 7890 189",
    });
    expect(r.iban).toBe("FR7630006000011234567890189");
  });

  it("rejette un IBAN trop court", () => {
    const r = companySchema.safeParse({ ...base, iban: "FR12" });
    expect(r.success).toBe(false);
  });
});
