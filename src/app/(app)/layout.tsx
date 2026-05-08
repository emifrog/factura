import { DashboardSidebar, DashboardSidebarProvider } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { requireUser } from "@/lib/auth";

/**
 * Layout du groupe (app) — toutes les routes authentifiées.
 *
 * `dynamic = "force-dynamic"` parce que ces pages dépendent de la session
 * Supabase (cookies) : aucune ne peut être prérendue statiquement.
 *
 * Le proxy redirige déjà les visiteurs non authentifiés vers /login. Le
 * `requireUser()` ici sert de défense en profondeur et fournit l'email
 * pour la topbar sans qu'il soit relu dans chaque page enfant.
 *
 * `DashboardSidebarProvider` partage l'état d'ouverture du drawer mobile
 * entre la sidebar et le bouton trigger placé dans la topbar.
 */
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <DashboardSidebarProvider>
      <div className="flex h-dvh">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar email={user.email ?? ""} />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </DashboardSidebarProvider>
  );
}
