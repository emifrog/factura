import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-actions";
import { DashboardSidebarMobileTrigger } from "@/components/dashboard-sidebar";

export function DashboardTopbar({ email }: { email: string }) {
  return (
    <header className="bg-surface-container-lowest border-outline-variant flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-8">
      <DashboardSidebarMobileTrigger />

      <div className="ml-auto flex items-center gap-4">
        <span className="text-on-surface-variant hidden text-sm sm:inline" title={email}>
          {email}
        </span>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Se déconnecter</span>
            <span className="sr-only sm:hidden">Se déconnecter</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
