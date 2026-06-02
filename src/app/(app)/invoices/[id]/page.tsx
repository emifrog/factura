import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconLock,
  IconCheck,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { markInvoicePaid } from "@/lib/invoices/actions";
import type { InvoiceStatus } from "@/lib/supabase/database.types";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceDownloads } from "@/components/app/invoice-downloads";

export const metadata: Metadata = { title: "Facture" };

const STATUS: Record<
  InvoiceStatus,
  { label: string; tone: "neutral" | "action" | "success" | "danger" }
> = {
  draft: { label: "Brouillon", tone: "neutral" },
  issued: { label: "Émise", tone: "action" },
  sent: { label: "Envoyée", tone: "action" },
  paid: { label: "Payée", tone: "success" },
  overdue: { label: "En retard", tone: "danger" },
  cancelled: { label: "Annulée", tone: "neutral" },
};

function fmt(n: number, currency: string) {
  return `${Number(n).toFixed(2)} ${currency}`;
}

type Snapshot = {
  name?: string;
  siren?: string | null;
  vatNumber?: string | null;
} | null;

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!invoice) notFound();
  if (invoice.status === "draft") redirect(`/invoices/${id}/edit`);

  const seller = invoice.seller_snapshot as Snapshot;
  const buyer = invoice.buyer_snapshot as Snapshot;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <IconArrowLeft size={16} aria-hidden /> Factures
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {invoice.number}
          </h1>
          <Badge tone={STATUS[invoice.status].tone}>
            {STATUS[invoice.status].label}
          </Badge>
        </div>
      </header>

      <Card>
        <CardBody className="flex flex-col gap-6">
          <div className="flex items-center gap-3 rounded-md bg-success/10 px-4 py-3">
            <IconShieldCheck size={20} className="text-success" aria-hidden />
            <span className="text-sm font-medium text-ink">
              Factur-X conforme EN 16931 généré et archivé.
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                Vendeur
              </div>
              <div className="mt-1 text-sm text-ink">{seller?.name}</div>
              {seller?.siren && (
                <div className="text-xs text-ink-subtle">
                  SIREN {seller.siren}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                Client
              </div>
              <div className="mt-1 text-sm text-ink">{buyer?.name}</div>
              {buyer?.siren && (
                <div className="text-xs text-ink-subtle">
                  SIREN {buyer.siren}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                Émise le
              </div>
              <div className="mt-1 text-sm text-ink">{invoice.issue_date}</div>
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                Total TTC
              </div>
              <div className="mt-1 font-display text-lg font-semibold text-ink">
                {fmt(invoice.grand_total, invoice.currency)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <InvoiceDownloads id={invoice.id} />
            {(invoice.status === "issued" ||
              invoice.status === "sent" ||
              invoice.status === "overdue") && (
              <form action={markInvoicePaid}>
                <input type="hidden" name="id" value={invoice.id} />
                <Button type="submit" variant="success" size="sm">
                  <IconCheck size={16} aria-hidden /> Marquer payée
                </Button>
              </form>
            )}
          </div>

          {invoice.paid_at && (
            <p className="text-sm text-success">
              Payée le {invoice.paid_at.slice(0, 10)}.
            </p>
          )}

          {invoice.sha256 && (
            <div className="flex items-start gap-2 border-t border-border pt-4 text-xs text-ink-subtle">
              <IconLock size={14} className="mt-0.5 shrink-0" aria-hidden />
              <div>
                <span className="font-medium text-ink-muted">
                  Empreinte d&apos;intégrité (SHA-256)
                </span>
                <div className="font-mono break-all">{invoice.sha256}</div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
