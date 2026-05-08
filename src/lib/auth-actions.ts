"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { loginSchema, type LoginResult } from "@/lib/auth-schema";

/**
 * Envoie un magic link à l'email fourni.
 *
 * - Valide via Zod côté serveur (même si déjà validé côté client).
 * - `emailRedirectTo` doit pointer sur notre Route Handler /auth/callback,
 *   qui échangera le code contre une session puis redirigera vers `next`
 *   (ou /account par défaut).
 *
 * En cas d'erreur Supabase, on renvoie un message générique : on évite de
 * révéler si l'email existe déjà ou non (énumération de comptes).
 */
export async function signInWithMagicLink(input: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const env = getPublicEnv();
  const supabase = await createClient();

  const callbackUrl = new URL("/auth/callback", env.NEXT_PUBLIC_APP_URL);
  if (parsed.data.next) {
    callbackUrl.searchParams.set("next", parsed.data.next);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    console.error("magic link send failed", error);
    return {
      ok: false,
      error: "server",
      message: "Impossible d'envoyer l'email pour l'instant. Réessayez dans un instant.",
    };
  }

  return { ok: true };
}

/**
 * Déconnecte l'utilisateur courant et redirige vers la home.
 * Appelée depuis un formulaire (Server Action) sur /account.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
