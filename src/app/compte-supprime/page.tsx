import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Compte supprimé",
  robots: { index: false },
};

export default function AccountDeletedPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Logo />
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        Votre compte est en cours de suppression
      </h1>
      <p className="text-sm leading-relaxed text-ink-muted">
        Vos données personnelles seront définitivement supprimées sous 30 jours.
        Conformément à la loi, les factures émises sont conservées 10 ans.
      </p>
      <Link href="/" className="text-sm font-semibold text-action">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
