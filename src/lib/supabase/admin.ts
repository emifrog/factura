import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Client Supabase à privilèges service_role — CONTOURNE les RLS.
 * À n'utiliser QUE côté serveur, pour des opérations contrôlées
 * (ex. insertion dans `waitlist`, qui n'a aucune policy publique).
 * Ne jamais importer ce module dans un Client Component.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
