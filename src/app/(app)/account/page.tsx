import type { Metadata } from "next";
import { IconDownload, IconFileSpreadsheet } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/app/profile-form";
import { DeleteAccountButton } from "@/components/app/delete-account-button";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <header>
        <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
          Compte
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Mon profil
        </h1>
      </header>

      <Card>
        <CardBody>
          <ProfileForm
            email={profile?.email ?? user!.email!}
            fullName={profile?.full_name ?? null}
          />
        </CardBody>
      </Card>

      {/* Exports */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
            Exports
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-2 text-sm text-ink">
                Export comptable (CSV des factures émises)
              </p>
              <div className="flex flex-wrap gap-2">
                {years.map((y) => (
                  <Button key={y} asChild variant="secondary" size="sm">
                    <a href={`/api/export/invoices-csv?year=${y}`}>
                      <IconFileSpreadsheet size={16} aria-hidden /> {y}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-ink">
                Export RGPD complet (toutes vos données + PDFs)
              </p>
              <Button asChild variant="secondary" size="sm">
                <a href="/api/export/rgpd">
                  <IconDownload size={16} aria-hidden /> Télécharger mes données
                </a>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Zone dangereuse */}
      <Card className="border-danger-surface">
        <CardBody className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold tracking-[0.05em] text-danger-strong uppercase">
            Supprimer mon compte
          </h2>
          <p className="text-sm text-ink-muted">
            Clôture votre compte. Données personnelles supprimées sous 30 jours,
            factures conservées 10 ans (obligation légale).
          </p>
          <DeleteAccountButton />
        </CardBody>
      </Card>
    </div>
  );
}
