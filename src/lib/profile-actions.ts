"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { profileSchema, type ProfileResult } from "@/lib/profile-schema";

/**
 * Met à jour le profil de l'utilisateur courant (first_name, last_name).
 *
 * - requireUser() garantit qu'une session valide existe (sinon redirect
 *   /login). Le proxy fait déjà la première barrière.
 * - La policy RLS profiles_update_own (auth.uid() = id) garantit que
 *   l'update ne touche que la row du user courant, même si un attaquant
 *   forgeait un payload avec un autre id.
 * - revalidatePath('/account') pour rafraîchir la page après update.
 */
export async function updateProfile(input: unknown): Promise<ProfileResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.first_name ?? null,
      last_name: parsed.data.last_name ?? null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("profile update failed", error);
    return { ok: false, error: "server" };
  }

  revalidatePath("/account");
  return { ok: true };
}
