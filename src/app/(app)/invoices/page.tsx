import type { Metadata } from "next";
import Link from "next/link";
import { IconPlus, IconFileInvoice } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { createDraft } from "@/lib/invoices/actions";
import type { InvoiceStatus } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Factures" };

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

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, number, status, grand_total, currency, issue_date, client_id, created_at",
    )
    .order("created_at", { ascending: false });

  const clientIds = [
    ...new Set((invoices ?? []).map((i) => i.client_id).filter(Boolean)),
  ] as string[];
  const clientNames = new Map<string, string>();
  if (clientIds.length) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds);
    for (const c of clients ?? []) clientNames.set(c.id, c.name);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
            Facturation
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Factures
          </h1>
        </div>
        <form action={createDraft}>
          <Button type="submit">
            <IconPlus size={16} aria-hidden /> Nouvelle facture
          </Button>
        </form>
      </header>

      {!invoices || invoices.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <IconFileInvoice size={32} className="text-ink-subtle" aria-hidden />
          <p className="text-sm text-ink-muted">
            Aucune facture. Créez votre première facture conforme.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul>
            {invoices.map((inv, i) => {
              const s = STATUS[inv.status];
              const href =
                inv.status === "draft"
                  ? `/invoices/${inv.id}/edit`
                  : `/invoices/${inv.id}`;
              return (
                <li
                  key={inv.id}
                  className={i > 0 ? "border-t border-border" : undefined}
                >
                  <Link
                    href={href}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-subtle"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-ink">
                          {inv.number ?? "Brouillon"}
                        </span>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                      <div className="mt-1 truncate text-xs text-ink-subtle">
                        {[
                          inv.client_id
                            ? clientNames.get(inv.client_id)
                            : "Sans client",
                          inv.issue_date,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <span className="tnum font-display text-sm font-semibold text-ink">
                      {fmt(inv.grand_total, inv.currency)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
