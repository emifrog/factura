"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AcceptQuoteResult } from "./schemas";

const TOKEN_RE = /^[0-9a-f-]{36}$/i;

/**
 * Acceptation publique d'un devis (lien tokenisé, sans authentification).
 * E-signature simple : nom + consentement + horodatage. Service-role car le
 * visiteur n'est pas authentifié ; on ne touche qu'au devis ciblé par le token.
 */
export async function acceptQuote(
  _prev: AcceptQuoteResult,
  formData: FormData,
): Promise<AcceptQuoteResult> {
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("signerName") ?? "").trim();
  const consent = formData.get("consent");

  if (!TOKEN_RE.test(token)) return { ok: false, error: "Lien invalide." };
  if (name.length < 2) return { ok: false, error: "Indiquez votre nom." };
  if (!consent) {
    return { ok: false, error: "Cochez la case pour accepter le devis." };
  }

  const supabase = createAdminClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("public_token", token)
    .maybeSingle();
  if (!quote) return { ok: false, error: "Devis introuvable." };
  if (quote.status !== "sent") {
    return { ok: false, error: "Ce devis n'est plus en attente de réponse." };
  }

  const { error } = await supabase
    .from("quotes")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: name,
    })
    .eq("id", quote.id)
    .eq("status", "sent");
  if (error) return { ok: false, error: "Échec de l'enregistrement." };

  revalidatePath(`/d/${token}`);
  return { ok: true, decision: "accepted" };
}

/** Refus public d'un devis. */
export async function refuseQuote(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!TOKEN_RE.test(token)) return;

  const supabase = createAdminClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("public_token", token)
    .maybeSingle();
  if (!quote || quote.status !== "sent") return;

  await supabase
    .from("quotes")
    .update({ status: "refused" })
    .eq("id", quote.id)
    .eq("status", "sent");

  revalidatePath(`/d/${token}`);
}
