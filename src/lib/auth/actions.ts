"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { magicLinkSchema, type MagicLinkState } from "./schemas";

function resolveSiteUrl(originHeader: string | null) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? originHeader ?? "http://localhost:3000"
  );
}

/**
 * Envoie un magic link. Unifie login et inscription : `shouldCreateUser: true`
 * crée le compte si l'email est inconnu. Le `full_name` (inscription) est passé
 * en métadonnée et repris par le trigger handle_new_user.
 */
export async function requestMagicLink(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors: { email?: string; fullName?: string } = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" && !fieldErrors.email)
        fieldErrors.email = issue.message;
      if (key === "fullName" && !fieldErrors.fullName)
        fieldErrors.fullName = issue.message;
    }
    return { status: "error", message: "Vérifiez le formulaire.", fieldErrors };
  }

  const { email, fullName } = parsed.data;
  const supabase = await createClient();
  const requestHeaders = await headers();
  const siteUrl = resolveSiteUrl(requestHeaders.get("origin"));

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "Envoi impossible pour le moment. Réessayez dans un instant.",
    };
  }

  return { status: "success", email };
}

/** Déconnecte l'utilisateur et le renvoie à l'accueil. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
