import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  source: z.string().trim().max(64).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export type WaitlistResult =
  | { ok: true }
  | { ok: false; error: "invalid"; fieldErrors: Record<string, string[]> }
  | { ok: false; error: "already_registered" }
  | { ok: false; error: "server" };
