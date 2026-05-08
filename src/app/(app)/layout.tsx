/**
 * Layout du groupe (app) — toutes les routes authentifiées.
 *
 * `dynamic = "force-dynamic"` parce que ces pages dépendent de la session
 * Supabase (cookies) : aucune ne peut être prérendue statiquement.
 */
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
