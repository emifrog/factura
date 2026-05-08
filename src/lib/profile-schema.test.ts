import { describe, it, expect } from "vitest";
import { profileSchema } from "./profile-schema";

describe("profileSchema", () => {
  it("accepte un profil complet", () => {
    const result = profileSchema.safeParse({ first_name: "Jean", last_name: "Dupont" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.first_name).toBe("Jean");
      expect(result.data.last_name).toBe("Dupont");
    }
  });

  it("trim les champs", () => {
    const result = profileSchema.safeParse({ first_name: "  Jean  ", last_name: " Dupont " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.first_name).toBe("Jean");
      expect(result.data.last_name).toBe("Dupont");
    }
  });

  it("transforme les chaînes vides en null", () => {
    const result = profileSchema.safeParse({ first_name: "", last_name: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.first_name).toBeNull();
      expect(result.data.last_name).toBeNull();
    }
  });

  it("transforme les chaînes uniquement-espaces en null après trim", () => {
    const result = profileSchema.safeParse({ first_name: "   ", last_name: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.first_name).toBeNull();
      expect(result.data.last_name).toBeNull();
    }
  });

  it("accepte un objet vide (les deux champs sont optionnels)", () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("refuse un champ de plus de 80 caractères", () => {
    const result = profileSchema.safeParse({ first_name: "x".repeat(81) });
    expect(result.success).toBe(false);
  });

  it("accepte exactement 80 caractères", () => {
    const result = profileSchema.safeParse({ first_name: "x".repeat(80) });
    expect(result.success).toBe(true);
  });
});
