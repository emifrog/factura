import { describe, it, expect } from "vitest";
import { magicLinkSchema } from "./schemas";

describe("magicLinkSchema", () => {
  it("normalise l'email (trim + minuscules)", () => {
    const result = magicLinkSchema.parse({ email: "  Jean@Exemple.FR  " });
    expect(result.email).toBe("jean@exemple.fr");
  });

  it("rejette un email invalide", () => {
    const result = magicLinkSchema.safeParse({ email: "pas-un-email" });
    expect(result.success).toBe(false);
  });

  it("rejette un email vide", () => {
    const result = magicLinkSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("transforme un fullName vide en undefined", () => {
    const result = magicLinkSchema.parse({
      email: "a@b.fr",
      fullName: "   ",
    });
    expect(result.fullName).toBeUndefined();
  });

  it("conserve un fullName valide", () => {
    const result = magicLinkSchema.parse({
      email: "a@b.fr",
      fullName: "Jean Dupont",
    });
    expect(result.fullName).toBe("Jean Dupont");
  });
});
