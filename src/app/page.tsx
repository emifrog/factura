import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-8 py-16 sm:py-24">
      <header className="flex flex-col gap-5">
        <span className="text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
          Réforme 2026 · Opérateur de Dématérialisation
        </span>
        <h1 className="font-heading max-w-3xl text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
          Factura — facturation électronique pour freelances.
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          Le moins cher pour être conforme à la réforme française. Factur-X conforme EN 16931,
          archivage 10 ans, émission via PDP partenaire. À partir de 9 €/mois.
        </p>
        <div className="mt-2 max-w-xl">
          <WaitlistForm source="landing" />
          <p className="text-on-surface-variant mt-3 text-xs">
            On vous prévient au lancement. Pas de spam, pas de partage de votre email.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conforme dès 2026</CardTitle>
            <CardDescription>
              Factur-X (PDF/A-3 + XML CII), mentions obligatoires 2026, validation EN 16931.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Émission via PDP</CardTitle>
            <CardDescription>
              Branchement sur une PDP partenaire pour l&apos;envoi vers le PPF et vos clients.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Archivage 10 ans</CardTitle>
            <CardDescription>
              Conservation à valeur probante avec hash d&apos;intégrité, restitution sous 30 jours.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <footer className="text-on-surface-variant mt-auto text-sm">
        En cours de construction · Aucune donnée collectée · Hébergement UE.
      </footer>
    </main>
  );
}
