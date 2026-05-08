/**
 * Layout du groupe (auth) — pages liées à la connexion (login, callback).
 *
 * `dynamic = "force-dynamic"` parce que ces pages lisent ou écrivent des
 * cookies de session Supabase.
 */
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
