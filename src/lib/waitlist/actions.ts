"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isEmailConfigured,
  sendWaitlistConfirmation,
} from "@/lib/email/resend";
import { waitlistSchema, type WaitlistState } from "./schemas";

/**
 * Inscription à la liste d'attente (double opt-in).
 * Insertion via service_role (la table waitlist n'a aucune policy publique),
 * puis envoi d'un email de confirmation. Idempotent sur l'email.
 */
export async function joinWaitlist(
  _prevState: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Adresse email invalide.",
    };
  }

  const { email, source } = parsed.data;
  const supabase = createAdminClient();

  let token: string | null = null;
  let alreadyConfirmed = false;

  const { data: inserted, error: insertError } = await supabase
    .from("waitlist")
    .insert({ email, source })
    .select("confirmation_token, confirmed_at")
    .single();

  if (insertError) {
    // 23505 = violation d'unicité : email déjà inscrit → on récupère le token.
    if (insertError.code === "23505") {
      const { data: existing } = await supabase
        .from("waitlist")
        .select("confirmation_token, confirmed_at")
        .eq("email", email)
        .single();
      token = existing?.confirmation_token ?? null;
      alreadyConfirmed = Boolean(existing?.confirmed_at);
    } else {
      return { status: "error", message: "Inscription impossible. Réessayez." };
    }
  } else {
    token = inserted.confirmation_token;
    alreadyConfirmed = Boolean(inserted.confirmed_at);
  }

  // Déjà confirmé : rien à renvoyer, on confirme simplement le succès.
  if (alreadyConfirmed) {
    return { status: "success" };
  }

  if (!token) {
    return { status: "error", message: "Inscription impossible. Réessayez." };
  }

  const requestHeaders = await headers();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestHeaders.get("origin") ??
    "http://localhost:3000";
  const confirmUrl = `${siteUrl}/waitlist/confirm?token=${token}`;

  if (!isEmailConfigured()) {
    return {
      status: "error",
      message:
        "Inscription enregistrée, mais l'email de confirmation n'a pas pu être envoyé (Resend non configuré).",
    };
  }

  try {
    await sendWaitlistConfirmation(email, confirmUrl);
  } catch {
    return {
      status: "error",
      message: "Inscription enregistrée, mais l'envoi de l'email a échoué.",
    };
  }

  return { status: "success" };
}
