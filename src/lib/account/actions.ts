"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";

/**
 * Demande de suppression de compte (RGPD) : soft-delete + déconnexion.
 * Les factures émises restent conservées (obligation légale 10 ans) ; la purge
 * définitive des données personnelles intervient après 30 jours.
 */
export async function requestAccountDeletion() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", user.id);

  await logAudit(supabase, {
    profileId: user.id,
    entityType: "account",
    action: "account_deleted",
  });

  await supabase.auth.signOut();
  redirect("/compte-supprime");
}
