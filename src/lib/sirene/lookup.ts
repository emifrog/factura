import {
  sirenSchema,
  sireneApiResponseSchema,
  type SireneCompany,
  type SireneLookupResult,
} from "./schemas";

const API_URL = "https://recherche-entreprises.api.gouv.fr/search";

/**
 * Numéro de TVA intracommunautaire français, dérivé du SIREN.
 * Clé = (12 + 3 × (SIREN mod 97)) mod 97.
 */
export function computeFrenchVat(siren: string): string {
  const key = (12 + 3 * (Number(siren) % 97)) % 97;
  return `FR${String(key).padStart(2, "0")}${siren}`;
}

function buildAddressLine(siege: {
  numero_voie?: string | null;
  type_voie?: string | null;
  libelle_voie?: string | null;
}): string | null {
  const parts = [siege.numero_voie, siege.type_voie, siege.libelle_voie]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

/**
 * Vérifie un SIREN et renvoie raison sociale + adresse du siège via l'API
 * publique recherche-entreprises (data.gouv, sans clé d'API).
 */
export async function lookupSiren(input: string): Promise<SireneLookupResult> {
  const parsed = sirenSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }
  const siren = parsed.data;

  let response: Response;
  try {
    response = await fetch(`${API_URL}?q=${siren}&page=1&per_page=1`, {
      signal: AbortSignal.timeout(5000),
      headers: { accept: "application/json" },
    });
  } catch {
    return {
      status: "error",
      message: "Service SIREN indisponible. Réessayez ou saisissez à la main.",
    };
  }

  if (!response.ok) {
    return { status: "error", message: "Service SIREN indisponible." };
  }

  const json = await response.json().catch(() => null);
  const data = sireneApiResponseSchema.safeParse(json);
  if (!data.success) {
    return { status: "error", message: "Réponse SIREN inattendue." };
  }

  // L'API fait une recherche large : on ne garde que la correspondance exacte.
  const match = data.data.results.find((r) => r.siren === siren);
  if (!match) {
    return { status: "not_found" };
  }

  const company: SireneCompany = {
    siren,
    legalName:
      match.nom_raison_sociale?.trim() || match.nom_complet?.trim() || "",
    addressLine1: match.siege ? buildAddressLine(match.siege) : null,
    postalCode: match.siege?.code_postal?.trim() || null,
    city: match.siege?.libelle_commune?.trim() || null,
    vatNumber: computeFrenchVat(siren),
  };

  return { status: "found", company };
}
