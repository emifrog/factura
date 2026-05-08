"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { waitlistSchema, type WaitlistResult } from "@/lib/waitlist-schema";

/**
 * Inscrit un email sur la liste d'attente.
 *
 * - Valide email + source via Zod.
 * - Insère dans la table publique `waitlist` (RLS : insert anon autorisé).
 * - Si l'email est déjà présent (contrainte UNIQUE), on retourne
 *   `already_registered` plutôt qu'une erreur générique pour offrir une UX
 *   neutre (volontairement pas de "merci" dans ce cas pour ne pas révéler
 *   l'inscription précédente, mais on ne renvoie pas non plus d'erreur).
 */
export async function addToWaitlist(input: unknown): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("waitlist")
    .insert({ email: parsed.data.email, source: parsed.data.source ?? null });

  if (error) {
    // 23505 = unique_violation Postgres
    if (error.code === "23505") {
      return { ok: false, error: "already_registered" };
    }
    console.error("waitlist insert failed", error);
    return { ok: false, error: "server" };
  }

  return { ok: true };
}
