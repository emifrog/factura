import { z } from "zod";

/** SIREN : 9 chiffres. Tolère les espaces à la saisie. */
export const sirenSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s/g, ""))
  .pipe(
    z.string().regex(/^[0-9]{9}$/, "SIREN invalide (9 chiffres attendus)."),
  );

/** Sous-ensemble de la réponse recherche-entreprises.api.gouv.fr qu'on exploite. */
export const sireneApiResponseSchema = z.object({
  results: z
    .array(
      z.object({
        siren: z.string(),
        nom_complet: z.string().nullish(),
        nom_raison_sociale: z.string().nullish(),
        siege: z
          .object({
            numero_voie: z.string().nullish(),
            type_voie: z.string().nullish(),
            libelle_voie: z.string().nullish(),
            code_postal: z.string().nullish(),
            libelle_commune: z.string().nullish(),
          })
          .nullish(),
      }),
    )
    .default([]),
});

/** Entreprise normalisée renvoyée par le service. */
export type SireneCompany = {
  siren: string;
  legalName: string;
  addressLine1: string | null;
  postalCode: string | null;
  city: string | null;
  vatNumber: string;
};

export type SireneLookupResult =
  | { status: "found"; company: SireneCompany }
  | { status: "not_found" }
  | { status: "error"; message: string };
