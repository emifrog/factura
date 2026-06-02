"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutGrid,
  IconFileInvoice,
  IconFileText,
  IconInbox,
  IconUsers,
  IconUser,
  IconBuilding,
  IconCreditCard,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  /** Fonctionnalité d'une phase ultérieure : affichée mais désactivée. */
  soon?: boolean;
};

const ESPACE: NavItem[] = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: IconLayoutGrid },
  { href: "/invoices", label: "Factures", icon: IconFileInvoice },
  { href: "/devis", label: "Devis", icon: IconFileText },
  { href: "/inbox", label: "Réception", icon: IconInbox, soon: true },
  { href: "/clients", label: "Clients", icon: IconUsers },
];

const COMPTE: NavItem[] = [
  { href: "/account", label: "Mon profil", icon: IconUser },
  { href: "/company", label: "Entreprise", icon: IconBuilding },
  { href: "/billing", label: "Abonnement", icon: IconCreditCard, soon: true },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon size={18} aria-hidden />
      <span>{item.label}</span>
      {item.soon && (
        <span className="ml-auto text-[11px] font-medium text-ink-subtle">
          bientôt
        </span>
      )}
    </>
  );

  if (item.soon) {
    return (
      <span
        className="flex cursor-default items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink-subtle"
        aria-disabled
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
        active
          ? "border border-border bg-surface font-semibold text-brand"
          : "text-ink-muted hover:bg-surface",
      )}
    >
      {content}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-1 pb-2 text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
      {children}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex w-[220px] flex-col gap-1 border-r border-border bg-canvas p-4">
      <div className="px-2 pt-1 pb-6">
        <Logo />
      </div>

      <SectionLabel>Espace</SectionLabel>
      <nav className="flex flex-col gap-0.5">
        {ESPACE.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="mt-6 border-t border-border-strong pt-4">
        <SectionLabel>Compte</SectionLabel>
        <nav className="flex flex-col gap-0.5">
          {COMPTE.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
