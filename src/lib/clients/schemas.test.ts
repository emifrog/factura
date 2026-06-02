import { describe, it, expect } from "vitest";
import { clientSchema } from "./schemas";

describe("clientSchema", () => {
  it("exige un SIREN pour un client B2B", () => {
    const r = clientSchema.safeParse({ kind: "b2b", name: "Acme" });
    expect(r.success).toBe(false);
  });

  it("accepte un B2B avec SIREN valide", () => {
    const r = clientSchema.safeParse({
      kind: "b2b",
      name: "Acme",
      siren: "123456789",
    });
    expect(r.success).toBe(true);
  });

  it("accepte un B2C sans SIREN", () => {
    const r = clientSchema.safeParse({ kind: "b2c", name: "Jean Dupont" });
    expect(r.success).toBe(true);
  });

  it("rejette un SIREN mal formé", () => {
    const r = clientSchema.safeParse({
      kind: "b2b",
      name: "Acme",
      siren: "12AB",
    });
    expect(r.success).toBe(false);
  });

  it("rejette un email invalide mais accepte un email vide", () => {
    expect(
      clientSchema.safeParse({ kind: "b2c", name: "X", email: "nope" }).success,
    ).toBe(false);
    const ok = clientSchema.parse({ kind: "b2c", name: "X", email: "" });
    expect(ok.email).toBeNull();
  });

  it("met le pays par défaut à FR", () => {
    const r = clientSchema.parse({ kind: "b2c", name: "X" });
    expect(r.country).toBe("FR");
  });
});
