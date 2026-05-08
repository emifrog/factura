import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  // Chemin relatif uniquement : doit commencer par "/" mais pas "//" ni "/\".
  // Sinon `next=//evil.com` ou `next=/\evil.com` permettrait un open redirect
  // au moment du callback magic link.
  next: z
    .string()
    .regex(/^\/(?!\/|\\)/, "Chemin de redirection invalide")
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginResult =
  | { ok: true }
  | { ok: false; error: "invalid"; fieldErrors: Record<string, string[]> }
  | { ok: false; error: "server"; message: string };
