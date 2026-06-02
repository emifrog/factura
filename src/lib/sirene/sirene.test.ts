import { describe, it, expect } from "vitest";
import { sirenSchema } from "./schemas";
import { computeFrenchVat } from "./lookup";

describe("sirenSchema", () => {
  it("strippe les espaces et accepte 9 chiffres", () => {
    expect(sirenSchema.parse("123 456 789")).toBe("123456789");
  });

  it("rejette autre chose que 9 chiffres", () => {
    expect(sirenSchema.safeParse("1234").success).toBe(false);
    expect(sirenSchema.safeParse("12345678A").success).toBe(false);
  });
});

describe("computeFrenchVat", () => {
  it("calcule la clé TVA française (formule mod 97)", () => {
    // clé = (12 + 3 × (SIREN mod 97)) mod 97 ; pour 000000001 → 15.
    expect(computeFrenchVat("000000001")).toBe("FR15000000001");
  });

  it("renvoie le format FR + 11 chiffres", () => {
    expect(computeFrenchVat("123456789")).toMatch(/^FR[0-9]{11}$/);
  });
});
