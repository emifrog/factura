import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalNoticePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <Logo />
      <div className="rounded-md border border-border-strong bg-surface-subtle px-4 py-3 text-xs text-ink-muted">
        ⚠️ Contenu provisoire à faire valider par un avocat avant le lancement.
      </div>
      <article className="prose-sm flex flex-col gap-4 text-sm leading-relaxed text-ink-muted">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Mentions légales
        </h1>
        <section>
          <h2 className="font-semibold text-ink">Éditeur</h2>
          <p>
            Factura — [forme juridique, capital, SIREN, adresse du siège].
            Directeur de la publication : [nom].
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Hébergement</h2>
          <p>
            Application hébergée par Vercel Inc. et Supabase (base de données et
            stockage, région Union européenne).
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Contact</h2>
          <p>[email de contact]</p>
        </section>
      </article>
      <Link href="/" className="text-sm font-semibold text-action">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
