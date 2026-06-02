import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconDownload } from "@tabler/icons-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Logo } from "@/components/brand/logo";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteAcceptForm } from "@/components/public/quote-accept-form";

export const metadata: Metadata = {
  title: "Devis",
  robots: { index: false },
};

function fmt(n: number, currency: string) {
  return `${Number(n).toFixed(2)} ${currency}`;
}

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();
  if (!quote || quote.status === "draft") notFound();

  const [{ data: company }, { data: client }, { data: lines }] =
    await Promise.all([
      supabase
        .from("companies")
        .select("legal_name, siren")
        .eq("profile_id", quote.profile_id)
        .maybeSingle(),
      quote.client_id
        ? supabase
            .from("clients")
            .select("name")
            .eq("id", quote.client_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("quote_lines")
        .select("*")
        .eq("quote_id", quote.id)
        .order("line_no"),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <Logo />
        <Badge tone="neutral">Devis {quote.number}</Badge>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                De
              </div>
              <div className="text-sm font-semibold text-ink">
                {company?.legal_name}
              </div>
              {company?.siren && (
                <div className="text-xs text-ink-subtle">
                  SIREN {company.siren}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                Pour
              </div>
              <div className="text-sm font-semibold text-ink">
                {client?.name}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-subtle text-xs text-ink-muted uppercase">
                  <th className="px-4 py-2 text-left font-semibold">
                    Description
                  </th>
                  <th className="px-4 py-2 text-right font-semibold">Qté</th>
                  <th className="px-4 py-2 text-right font-semibold">
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody>
                {(lines ?? []).map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2 text-ink">{l.description}</td>
                    <td className="tnum px-4 py-2 text-right text-ink-muted">
                      {Number(l.quantity)}
                    </td>
                    <td className="tnum px-4 py-2 text-right text-ink">
                      {fmt(l.line_total, quote.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Total HT</span>
                <span className="tnum">
                  {fmt(quote.line_total, quote.currency)}
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>TVA</span>
                <span className="tnum">
                  {fmt(quote.tax_total, quote.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-display text-lg font-semibold text-ink">
                <span>Total TTC</span>
                <span className="tnum">
                  {fmt(quote.grand_total, quote.currency)}
                </span>
              </div>
            </div>
          </div>

          <Button asChild variant="secondary" size="sm" className="self-start">
            <a href={`/d/${token}/pdf`} target="_blank" rel="noopener">
              <IconDownload size={16} aria-hidden /> Télécharger le PDF
            </a>
          </Button>
        </CardBody>
      </Card>

      {quote.status === "sent" ? (
        <Card>
          <CardBody>
            <QuoteAcceptForm token={token} />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <p className="text-sm text-ink-muted">
              {quote.status === "accepted" &&
                `Devis accepté${quote.accepted_by ? ` par ${quote.accepted_by}` : ""}.`}
              {quote.status === "refused" && "Ce devis a été refusé."}
              {quote.status === "expired" && "Ce devis a expiré."}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
