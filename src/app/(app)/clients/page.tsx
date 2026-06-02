import type { Metadata } from "next";
import Link from "next/link";
import { IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import type { ClientKind } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Clients" };

const KIND_LABEL: Record<ClientKind, string> = {
  b2b: "Professionnel",
  b2c: "Particulier",
  international: "International",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("id, kind, name, siren, email, city")
    .order("name");
  if (q && q.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }
  const { data: clients } = await query;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
            Carnet
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Clients
          </h1>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <IconPlus size={16} aria-hidden /> Nouveau client
          </Link>
        </Button>
      </header>

      <form method="get" className="flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <IconSearch
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher par nom…"
            aria-label="Rechercher un client"
            className="h-10 w-full rounded-md border border-border-strong bg-surface pr-4 pl-9 text-sm text-ink outline-none focus-visible:border-action focus-visible:ring-3 focus-visible:ring-action/20"
          />
        </div>
      </form>

      {!clients || clients.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <IconUsers size={32} className="text-ink-subtle" aria-hidden />
          <p className="text-sm text-ink-muted">
            {q
              ? "Aucun client ne correspond à cette recherche."
              : "Aucun client pour l'instant. Ajoutez votre premier client."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul>
            {clients.map((client, i) => (
              <li
                key={client.id}
                className={i > 0 ? "border-t border-border" : undefined}
              >
                <Link
                  href={`/clients/${client.id}/edit`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="truncate text-sm font-semibold text-ink">
                        {client.name}
                      </span>
                      <Badge
                        tone={client.kind === "b2b" ? "action" : "neutral"}
                      >
                        {KIND_LABEL[client.kind]}
                      </Badge>
                    </div>
                    <div className="mt-1 truncate text-xs text-ink-subtle">
                      {[
                        client.siren ? `SIREN ${client.siren}` : null,
                        client.email,
                        client.city,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                  </div>
                  <span className="text-sm text-action">Modifier</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
