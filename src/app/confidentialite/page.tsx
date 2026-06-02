import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <Logo />
      <div className="rounded-md border border-border-strong bg-surface-subtle px-4 py-3 text-xs text-ink-muted">
        ⚠️ Contenu provisoire à faire valider par un avocat avant le lancement.
      </div>
      <article className="flex flex-col gap-4 text-sm leading-relaxed text-ink-muted">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Politique de confidentialité
        </h1>
        <p>
          Factura traite vos données dans le seul but de fournir le service de
          facturation. Hébergement en Union européenne (Supabase).
        </p>
        <section>
          <h2 className="font-semibold text-ink">Données collectées</h2>
          <p>
            Compte (email, nom), entreprise, clients, factures et devis que vous
            créez.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Conservation</h2>
          <p>
            Les factures émises sont conservées 10 ans (obligation légale). Les
            autres données personnelles sont supprimées sous 30 jours après la
            clôture du compte.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Vos droits</h2>
          <p>
            Accès, rectification, portabilité (export de vos données depuis
            votre compte) et suppression. Aucun traceur publicitaire n&apos;est
            utilisé.
          </p>
        </section>
      </article>
      <Link href="/" className="text-sm font-semibold text-action">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
