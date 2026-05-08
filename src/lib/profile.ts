import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Récupère le profil de l'utilisateur courant.
 *
 * Le trigger handle_new_user crée automatiquement une row profile à
 * l'inscription, donc ce profil DOIT exister pour un user authentifié.
 * Si jamais il manque (cas anormal — backfill incomplet, suppression
 * manuelle), on lève — c'est un bug à corriger, pas un état à gérer.
 */
export async function getCurrentProfile(): Promise<Profile> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (error || !data) {
    throw new Error(`Profile manquant pour l'utilisateur ${user.id} : ${error?.message}`);
  }

  return data;
}
