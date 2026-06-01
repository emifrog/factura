import { z } from "zod";

/** Demande de magic link (login + signup unifiés). */
export const magicLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse email est requise.")
    .email("Adresse email invalide.")
    .transform((v) => v.toLowerCase()),
  // Optionnel : renseigné depuis le formulaire d'inscription uniquement.
  fullName: z
    .string()
    .trim()
    .max(120, "Nom trop long.")
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

/** État renvoyé par l'action requestMagicLink (consommé via useActionState). */
export type MagicLinkState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: { email?: string; fullName?: string };
    };
