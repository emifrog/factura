import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { Sidebar } from "@/components/app/sidebar";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts protège déjà ces routes ; double sécurité côté layout.
  if (!user) redirect("/login");

  // Compte en cours de suppression : on bloque l'accès.
  const { data: profile } = await supabase
    .from("profiles")
    .select("deleted_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.deleted_at) redirect("/compte-supprime");

  return (
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-border bg-surface px-8 py-4">
          <span className="text-sm text-ink-muted">{user.email}</span>
          <form action={signOut}>
            <Button type="submit" variant="secondary" size="sm">
              Déconnexion
            </Button>
          </form>
        </header>
        <main className="flex-1 bg-surface px-10 py-8">{children}</main>
      </div>
    </div>
  );
}
