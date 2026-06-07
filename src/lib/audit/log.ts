import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type AuditEntry = {
  profileId: string;
  entityType: "invoice" | "quote" | "account";
  entityId?: string | null;
  action: string;
  metadata?: Record<string, unknown> | null;
};

/**
 * Écrit un évènement dans le journal d'audit (append-only).
 * Non bloquant : un échec de journalisation ne casse jamais l'action métier.
 */
export async function logAudit(
  supabase: Client,
  entry: AuditEntry,
): Promise<void> {
  try {
    await supabase.from("audit_logs").insert({
      profile_id: entry.profileId,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      action: entry.action,
      metadata: (entry.metadata ?? null) as never,
    });
  } catch {
    // Journalisation best-effort.
  }
}
