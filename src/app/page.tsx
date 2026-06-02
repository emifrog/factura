import Link from "next/link";
import {
  IconShieldCheck,
  IconReceipt,
  IconArchive,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

const VALUE_PROPS = [
  {
    icon: IconShieldCheck,
    title: "Conforme 2026",
    body: "Factur-X, mentions obligatoires, désignation PDP. Vous êtes en règle, sans y penser.",
  },
  {
    icon: IconReceipt,
    title: "Émission & réception",
    body: "Envoyez et recevez vos factures électroniques. Relances automatiques incluses.",
  },
  {
    icon: IconArchive,
    title: "Archivage 10 ans",
    body: "Conservation légale garantie, intégrité vérifiable, export à tout moment.",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ waitlist?: string }>;
}) {
  const { waitlist } = await searchParams;

  return (
    <>
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Logo />
        <Button asChild variant="secondary" size="sm">
          <Link href="/login">Se connecter</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
        {waitlist === "confirme" && (
          <div className="mb-10 flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-semibold text-success">
            <IconCircleCheck size={16} aria-hidden /> Inscription confirmée,
            merci !
          </div>
        )}

        <div className="flex max-w-2xl flex-col items-center text-center">
          <Badge tone="success" className="mb-6">
            <IconShieldCheck size={14} aria-hidden /> Réforme facturation 2026
          </Badge>

          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            La facturation électronique, sans usine à gaz comptable.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            Factura prépare les freelances solo à la réforme : émission et
            réception conformes, archivage 10 ans.{" "}
            <span className="font-semibold text-ink">9 €/mois</span>, et
            c&apos;est tout.
          </p>

          <div className="mt-10 flex w-full flex-col items-center gap-3">
            <WaitlistForm />
            <p className="text-xs text-ink-subtle">
              Soyez prévenu·e du lancement. Pas de spam, désinscription en un
              clic.
            </p>
          </div>
        </div>

        <section className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-surface p-6 shadow-card"
            >
              <div className="flex size-9 items-center justify-center rounded-md bg-success/10">
                <Icon size={20} className="text-success" aria-hidden />
              </div>
              <h2 className="mt-4 font-display text-base font-semibold text-ink">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {body}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="flex flex-col items-center gap-2 border-t border-border px-6 py-8 text-center text-sm text-ink-subtle sm:px-10">
        <div>
          © 2026 Factura · Facturation électronique conforme pour freelances
        </div>
        <div className="flex gap-4">
          <Link href="/mentions-legales" className="hover:text-ink-muted">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-ink-muted">
            Confidentialité
          </Link>
        </div>
      </footer>
    </>
  );
}
