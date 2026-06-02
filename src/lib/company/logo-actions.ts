"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LOGO_MAX_DIMENSION, validateLogoFile } from "./logo";

export type LogoState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const LOGO_FILENAME = "logo.webp";

/** Téléverse le logo : validation, resize sharp, stockage privé, maj logo_path. */
export async function uploadLogo(
  _prevState: LogoState,
  formData: FormData,
): Promise<LogoState> {
  const file = formData.get("logo");
  if (!(file instanceof File)) {
    return { status: "error", message: "Sélectionnez un fichier." };
  }

  const validation = validateLogoFile({ type: file.type, size: file.size });
  if (!validation.ok) {
    return { status: "error", message: validation.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Session expirée. Reconnectez-vous." };
  }

  // Le logo se rattache à une entreprise existante (logo_path).
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!company) {
    return {
      status: "error",
      message: "Enregistrez d'abord votre entreprise.",
    };
  }

  let webp: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    webp = await sharp(input)
      .resize(LOGO_MAX_DIMENSION, LOGO_MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();
  } catch {
    return { status: "error", message: "Image illisible ou corrompue." };
  }

  const path = `${user.id}/${LOGO_FILENAME}`;
  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (uploadError) {
    return { status: "error", message: "Échec de l'upload." };
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_path: path })
    .eq("profile_id", user.id);
  if (updateError) {
    return { status: "error", message: "Échec de l'enregistrement." };
  }

  revalidatePath("/company");
  return { status: "success" };
}

/** Supprime le logo (Storage + logo_path). */
export async function deleteLogo(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.storage.from("logos").remove([`${user.id}/${LOGO_FILENAME}`]);
  await supabase
    .from("companies")
    .update({ logo_path: null })
    .eq("profile_id", user.id);

  revalidatePath("/company");
}
