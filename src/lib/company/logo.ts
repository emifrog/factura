export const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 Mo
export const LOGO_MAX_DIMENSION = 512; // px (côté max, ratio conservé)
export const ACCEPTED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type LogoValidation = { ok: true } | { ok: false; message: string };

/** Valide type et taille d'un fichier logo avant traitement. */
export function validateLogoFile(file: {
  type: string;
  size: number;
}): LogoValidation {
  if (file.size === 0) {
    return { ok: false, message: "Sélectionnez un fichier." };
  }
  if (
    !ACCEPTED_LOGO_TYPES.includes(
      file.type as (typeof ACCEPTED_LOGO_TYPES)[number],
    )
  ) {
    return { ok: false, message: "Format non supporté (PNG, JPEG ou WebP)." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, message: "Fichier trop volumineux (2 Mo max)." };
  }
  return { ok: true };
}
