import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import {
  InvoiceEditor,
  type EditorLine,
} from "@/components/app/invoice-editor";

export const metadata: Metadata = { title: "Éditer la facture" };

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!invoice) notFound();
  if (invoice.status !== "draft") redirect(`/invoices/${id}`);

  const [{ data: lines }, { data: clients }, { data: company }] =
    await Promise.all([
      supabase
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", id)
        .order("line_no"),
      supabase.from("clients").select("id, name").order("name"),
      supabase
        .from("companies")
        .select("id")
        .eq("profile_id", user!.id)
        .maybeSingle(),
    ]);

  const editorLines: EditorLine[] = (lines ?? []).map((l) => ({
    description: l.description,
    quantity: String(l.quantity),
    unitPrice: String(l.unit_price),
    vatRate: String(l.vat_rate),
    unitCode: l.unit_code,
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <IconArrowLeft size={16} aria-hidden /> Factures
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
          Nouvelle facture
        </h1>
      </header>

      <Card>
        <CardBody>
          <InvoiceEditor
            invoiceId={id}
            clients={clients ?? []}
            companyConfigured={Boolean(company)}
            initial={{
              clientId: invoice.client_id,
              category: invoice.category,
              dueDate: invoice.due_date,
              currency: invoice.currency,
              vatOnDebits: invoice.vat_on_debits,
              delivery: invoice.delivery_address_line1
                ? {
                    line1: invoice.delivery_address_line1 ?? "",
                    line2: invoice.delivery_address_line2 ?? "",
                    postalCode: invoice.delivery_postal_code ?? "",
                    city: invoice.delivery_city ?? "",
                    country: invoice.delivery_country ?? "FR",
                  }
                : null,
              lines: editorLines,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
