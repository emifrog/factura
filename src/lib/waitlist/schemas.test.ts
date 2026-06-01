import { describe, it, expect } from "vitest";
import { waitlistSchema } from "./schemas";

describe("waitlistSchema", () => {
  it("normalise l'email", () => {
    const result = waitlistSchema.parse({ email: " Test@Mail.COM " });
    expect(result.email).toBe("test@mail.com");
  });

  it("rejette un email invalide", () => {
    expect(waitlistSchema.safeParse({ email: "nope" }).success).toBe(false);
  });

  it("transforme une source vide en null", () => {
    const result = waitlistSchema.parse({ email: "a@b.fr", source: "" });
    expect(result.source).toBeNull();
  });

  it("conserve la source fournie", () => {
    const result = waitlistSchema.parse({ email: "a@b.fr", source: "landing" });
    expect(result.source).toBe("landing");
  });
});
