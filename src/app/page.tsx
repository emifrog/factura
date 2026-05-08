import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-4">
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Réforme 2026 · Opérateur de Dématérialisation
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Factura — facturation électronique pour freelances.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Le moins cher pour être conforme à la réforme française. Factur-X conforme EN 16931,
          archivage 10 ans, émission via PDP partenaire. À partir de 9 €/mois.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" disabled>
            Liste d&apos;attente (bientôt)
          </Button>
          <Button size="lg" variant="outline" disabled>
            En savoir plus
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <footer className="text-muted-foreground mt-auto text-sm">
        En cours de construction · Aucune donnée collectée · Hébergement UE.
      </footer>
    </main>
  );
}
