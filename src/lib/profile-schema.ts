import { z } from "zod";

/**
 * Schéma de validation du profil utilisateur.
 *
 * - Trim sur les champs string.
 * - Limite à 80 caractères (raisonnable pour un nom légal français — le
 *   record CNIL le plus long fait 60).
 * - Vide → null (en base, NULL = "non renseigné").
 */
const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

export const profileSchema = z.object({
  first_name: optionalString(80),
  last_name: optionalString(80),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export type ProfileResult =
  | { ok: true }
  | { ok: false; error: "invalid"; fieldErrors: Record<string, string[]> }
  | { ok: false; error: "server" };
