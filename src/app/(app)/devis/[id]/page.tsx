import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  IconArrowLeft,
  IconDownload,
  IconFileInvoice,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { convertQuoteToInvoice } from "@/lib/quotes/actions";
import type { QuoteStatus } from "@/lib/supabase/database.types";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuotePublicLink } from "@/components/app/quote-public-link";

export const metadata: Metadata = { title: "Devis" };

const STATUS: Record<
  QuoteStatus,
  { label: string; tone: "neutral" | "action" | "success" | "danger" }
> = {
  draft: { label: "Brouillon", tone: "neutral" },
  sent: { label: "Envoyé", tone: "action" },
  accepted: { label: "Accepté", tone: "success" },
  refused: { label: "Refusé", tone: "danger" },
  expired: { label: "Expiré", tone: "neutral" },
};

function fmt(n: number, currency: string) {
  return `${Number(n).toFixed(2)} ${currency}`;
}

export default async function QuoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!quote) notFound();
  if (quote.status === "draft") redirect(`/devis/${id}/edit`);

  const s = STATUS[quote.status];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const publicUrl = `${siteUrl}/d/${quote.public_token}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <Link
          href="/devis"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <IconArrowLeft size={16} aria-hidden /> Devis
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {quote.number}
          </h1>
          <Badge tone={s.tone}>{s.label}</Badge>
        </div>
      </header>

      <Card>
        <CardBody className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                Total TTC
              </div>
              <div className="mt-1 font-display text-lg font-semibold text-ink">
                {fmt(quote.grand_total, quote.currency)}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                Valable jusqu&apos;au
              </div>
              <div className="mt-1 text-sm text-ink">
                {quote.valid_until ?? "—"}
              </div>
            </div>
            {quote.accepted_at && (
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                  Accepté
                </div>
                <div className="mt-1 text-sm text-ink">
                  par {quote.accepted_by} · {quote.accepted_at.slice(0, 10)}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
              Lien d&apos;acceptation client
            </div>
            <QuotePublicLink url={publicUrl} />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-4">
            <Button asChild variant="secondary" size="sm">
              <a href={`/devis/${quote.id}/pdf`} target="_blank" rel="noopener">
                <IconDownload size={16} aria-hidden /> PDF du devis
              </a>
            </Button>
            {quote.status === "accepted" && (
              <form action={convertQuoteToInvoice}>
                <input type="hidden" name="id" value={quote.id} />
                <Button type="submit" variant="success" size="sm">
                  <IconFileInvoice size={16} aria-hidden /> Transformer en
                  facture
                </Button>
              </form>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
