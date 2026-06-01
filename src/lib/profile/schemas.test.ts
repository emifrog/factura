import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "./schemas";

describe("updateProfileSchema", () => {
  it("transforme un nom vide en null", () => {
    const result = updateProfileSchema.parse({ fullName: "  " });
    expect(result.fullName).toBeNull();
  });

  it("conserve un nom valide (trimmé)", () => {
    const result = updateProfileSchema.parse({ fullName: "  Jean Dupont " });
    expect(result.fullName).toBe("Jean Dupont");
  });

  it("rejette un nom trop long", () => {
    const result = updateProfileSchema.safeParse({ fullName: "a".repeat(121) });
    expect(result.success).toBe(false);
  });
});
