import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import {
  CompanyForm,
  type CompanyDefaults,
} from "@/components/app/company-form";
import { LogoUploader } from "@/components/app/logo-uploader";

export const metadata: Metadata = { title: "Mon entreprise" };

export default async function CompanyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("profile_id", user!.id)
    .maybeSingle();

  let logoUrl: string | null = null;
  if (company?.logo_path) {
    const { data: signed } = await supabase.storage
      .from("logos")
      .createSignedUrl(company.logo_path, 3600);
    logoUrl = signed?.signedUrl ?? null;
  }

  const defaults: CompanyDefaults = {
    legalName: company?.legal_name ?? "",
    siren: company?.siren ?? "",
    legalForm: company?.legal_form ?? "micro",
    vatRegime: company?.vat_regime ?? "franchise",
    vatNumber: company?.vat_number ?? "",
    vatOnDebits: company?.vat_on_debits ?? false,
    addressLine1: company?.address_line1 ?? "",
    addressLine2: company?.address_line2 ?? "",
    postalCode: company?.postal_code ?? "",
    city: company?.city ?? "",
    iban: company?.iban ?? "",
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
          Compte
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Mon entreprise
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Ces informations figureront sur vos factures. Vérifiez votre SIREN
          pour pré-remplir automatiquement.
        </p>
      </header>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
            Logo
          </h2>
          <LogoUploader logoUrl={logoUrl} />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CompanyForm defaults={defaults} />
        </CardBody>
      </Card>
    </div>
  );
}
