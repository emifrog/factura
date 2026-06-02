import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Card, CardBody } from "@/components/ui/card";
import { ClientForm, type ClientDefaults } from "@/components/app/client-form";

export const metadata: Metadata = { title: "Nouveau client" };

const emptyDefaults: ClientDefaults = {
  kind: "b2b",
  name: "",
  siren: "",
  vatNumber: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  country: "FR",
};

export default function NewClientPage() {
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
          Nouveau client
        </h1>
      </header>

      <Card>
        <CardBody>
          <ClientForm defaults={emptyDefaults} />
        </CardBody>
      </Card>
    </div>
  );
}
