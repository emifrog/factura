import { z } from "zod";

const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const companySchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(1, "La raison sociale est requise.")
    .max(200),
  siren: z
    .string()
    .trim()
    .optional()
    .default("")
    .transform((v) => v.replace(/\s/g, ""))
    .refine(
      (v) => v === "" || /^[0-9]{9}$/.test(v),
      "SIREN invalide (9 chiffres).",
    )
    .transform((v) => (v ? v : null)),
  legalForm: z.enum(["EI", "micro", "EURL", "SASU"], {
    message: "Forme juridique requise.",
  }),
  vatRegime: z.enum(["franchise", "reel_simplifie", "reel_normal"], {
    message: "Régime de TVA requis.",
  }),
  vatNumber: optionalText(20),
  vatOnDebits: z
    .union([z.literal("on"), z.literal("true")])
    .nullish()
    .transform((v) => v === "on" || v === "true"),
  addressLine1: optionalText(),
  addressLine2: optionalText(),
  postalCode: optionalText(10),
  city: optionalText(120),
  iban: z
    .string()
    .trim()
    .optional()
    .default("")
    .transform((v) => v.replace(/\s/g, "").toUpperCase())
    .refine((v) => v === "" || /^[A-Z0-9]{14,34}$/.test(v), "IBAN invalide.")
    .transform((v) => (v ? v : null)),
  reminderEnabled: z
    .union([z.literal("on"), z.literal("true")])
    .nullish()
    .transform((v) => v === "on" || v === "true"),
  reminderSignature: optionalText(500),
});

export type CompanyInput = z.infer<typeof companySchema>;

export type CompanySaveState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<keyof CompanyInput, string>>;
    };
