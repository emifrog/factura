import { describe, it, expect } from "vitest";
import { waitlistSchema } from "./waitlist-schema";

describe("waitlistSchema", () => {
  it("accepte un email valide", () => {
    const result = waitlistSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("normalise l'email (trim + lowercase)", () => {
    const result = waitlistSchema.safeParse({ email: "  USER@Example.COM  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("refuse une chaîne vide", () => {
    const result = waitlistSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("refuse un format email invalide", () => {
    const result = waitlistSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepte un source optionnel", () => {
    const result = waitlistSchema.safeParse({ email: "u@example.com", source: "landing" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe("landing");
    }
  });

  it("refuse un source de plus de 64 caractères", () => {
    const result = waitlistSchema.safeParse({
      email: "u@example.com",
      source: "x".repeat(65),
    });
    expect(result.success).toBe(false);
  });
});
