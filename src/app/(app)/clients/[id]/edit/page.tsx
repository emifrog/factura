import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { deleteClient } from "@/lib/clients/actions";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientForm, type ClientDefaults } from "@/components/app/client-form";

export const metadata: Metadata = { title: "Modifier le client" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!client) notFound();

  const defaults: ClientDefaults = {
    id: client.id,
    kind: client.kind,
    name: client.name,
    siren: client.siren ?? "",
    vatNumber: client.vat_number ?? "",
    email: client.email ?? "",
    addressLine1: client.address_line1 ?? "",
    addressLine2: client.address_line2 ?? "",
    postalCode: client.postal_code ?? "",
    city: client.city ?? "",
    country: client.country,
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <IconArrowLeft size={16} aria-hidden /> Clients
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
          {client.name}
        </h1>
      </header>

      <Card>
        <CardBody>
          <ClientForm defaults={defaults} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-ink">
              Supprimer ce client
            </div>
            <p className="text-sm text-ink-muted">
              Cette action est définitive.
            </p>
          </div>
          <form action={deleteClient}>
            <input type="hidden" name="id" value={client.id} />
            <Button type="submit" variant="danger" size="sm">
              <IconTrash size={16} aria-hidden /> Supprimer
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
