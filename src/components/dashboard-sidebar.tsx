"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { FileText, Menu, ReceiptText, User, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof User;
};

const NAV: readonly NavItem[] = [
  { href: "/account", label: "Mon compte", icon: User },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Factures", icon: ReceiptText },
  { href: "/quotes", label: "Devis", icon: FileText },
];

/**
 * Contexte qui partage l'état d'ouverture du drawer entre la sidebar
 * (qui contient le drawer) et le bouton trigger placé dans la topbar.
 */
type SidebarContextValue = { open: boolean; setOpen: (v: boolean) => void };
const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <DashboardSidebarProvider>");
  return ctx;
}

export function DashboardSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>;
}

export function DashboardSidebarMobileTrigger() {
  const { open, setOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="text-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-lg md:hidden"
      aria-label="Ouvrir le menu"
      aria-expanded={open}
      aria-controls="mobile-nav"
    >
      <Menu className="size-5" aria-hidden="true" />
    </button>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              active
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Sidebar fixe sur md+ */}
      <aside className="bg-background hidden w-56 shrink-0 border-r md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/account" className="text-base font-semibold tracking-tight">
            Factura
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks pathname={pathname} />
        </div>
      </aside>

      {/* Drawer mobile (visible < md uniquement quand `open`) */}
      {open ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          id="mobile-nav"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div className="bg-background absolute top-0 left-0 flex h-full w-64 flex-col border-r shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="text-base font-semibold tracking-tight">Factura</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg"
                aria-label="Fermer le menu"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
