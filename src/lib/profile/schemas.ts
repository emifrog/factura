import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(120, "Nom trop long (120 caractères max).")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type UpdateProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };
