import type { Metadata } from "next";
import Link from "next/link";
import { IconPlus, IconFileText } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { createQuoteDraft } from "@/lib/quotes/actions";
import type { QuoteStatus } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select(
      "id, number, status, grand_total, currency, valid_until, client_id, created_at",
    )
    .order("created_at", { ascending: false });

  const clientIds = [
    ...new Set((quotes ?? []).map((q) => q.client_id).filter(Boolean)),
  ] as string[];
  const names = new Map<string, string>();
  if (clientIds.length) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds);
    for (const c of clients ?? []) names.set(c.id, c.name);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
            Avant-vente
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Devis
          </h1>
        </div>
        <form action={createQuoteDraft}>
          <Button type="submit">
            <IconPlus size={16} aria-hidden /> Nouveau devis
          </Button>
        </form>
      </header>

      {!quotes || quotes.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <IconFileText size={32} className="text-ink-subtle" aria-hidden />
          <p className="text-sm text-ink-muted">
            Aucun devis. Créez votre premier devis.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul>
            {quotes.map((q, i) => {
              const s = STATUS[q.status];
              const href =
                q.status === "draft" ? `/devis/${q.id}/edit` : `/devis/${q.id}`;
              return (
                <li
                  key={q.id}
                  className={i > 0 ? "border-t border-border" : undefined}
                >
                  <Link
                    href={href}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-subtle"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-ink">
                          {q.number ?? "Brouillon"}
                        </span>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                      <div className="mt-1 truncate text-xs text-ink-subtle">
                        {[
                          q.client_id ? names.get(q.client_id) : "Sans client",
                          q.valid_until
                            ? `valable jusqu'au ${q.valid_until}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <span className="tnum font-display text-sm font-semibold text-ink">
                      {fmt(q.grand_total, q.currency)}
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
