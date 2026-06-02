import { z } from "zod";

const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const clientSchema = z
  .object({
    kind: z.enum(["b2b", "b2c", "international"], {
      message: "Type de client requis.",
    }),
    name: z.string().trim().min(1, "Le nom est requis.").max(200),
    siren: z
      .string()
      .trim()
      .optional()
      .default("")
      .transform((v) => v.replace(/\s/g, ""))
      .transform((v) => (v ? v : null)),
    vatNumber: optionalText(20),
    email: z
      .union([z.literal(""), z.string().email("Email invalide.")])
      .optional()
      .transform((v) => (v ? v.toLowerCase() : null)),
    addressLine1: optionalText(),
    addressLine2: optionalText(),
    postalCode: optionalText(10),
    city: optionalText(120),
    country: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .optional()
      .transform((v) => (v ? v.toUpperCase() : "FR")),
  })
  .superRefine((val, ctx) => {
    if (val.siren && !/^[0-9]{9}$/.test(val.siren)) {
      ctx.addIssue({
        code: "custom",
        path: ["siren"],
        message: "SIREN invalide (9 chiffres).",
      });
    }
    // Mention obligatoire B2B 2026 : SIREN requis pour un client professionnel.
    if (val.kind === "b2b" && !val.siren) {
      ctx.addIssue({
        code: "custom",
        path: ["siren"],
        message: "SIREN obligatoire pour un client professionnel.",
      });
    }
  });

export type ClientInput = z.infer<typeof clientSchema>;

export type ClientSaveState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };
