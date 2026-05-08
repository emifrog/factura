import { describe, it, expect } from "vitest";
import { loginSchema } from "./auth-schema";

describe("loginSchema", () => {
  it("accepte un email valide", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("normalise l'email (trim + lowercase)", () => {
    const result = loginSchema.safeParse({ email: "  USER@Example.COM  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("refuse un email invalide", () => {
    const result = loginSchema.safeParse({ email: "nope" });
    expect(result.success).toBe(false);
  });

  it("accepte un next relatif", () => {
    const result = loginSchema.safeParse({ email: "u@example.com", next: "/account" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.next).toBe("/account");
    }
  });

  it("refuse un next absolu (protection contre open redirect)", () => {
    const result = loginSchema.safeParse({
      email: "u@example.com",
      next: "https://evil.com/phish",
    });
    expect(result.success).toBe(false);
  });

  it("refuse un next protocol-relative (//evil.com)", () => {
    const result = loginSchema.safeParse({ email: "u@example.com", next: "//evil.com" });
    expect(result.success).toBe(false);
  });

  it("refuse un next backslash (/\\evil.com)", () => {
    const result = loginSchema.safeParse({ email: "u@example.com", next: "/\\evil.com" });
    expect(result.success).toBe(false);
  });
});
