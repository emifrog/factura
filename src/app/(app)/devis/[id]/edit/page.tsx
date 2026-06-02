import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import {
  QuoteEditor,
  type QuoteEditorLine,
} from "@/components/app/quote-editor";

export const metadata: Metadata = { title: "Éditer le devis" };

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!quote) notFound();
  if (quote.status !== "draft") redirect(`/devis/${id}`);

  const [{ data: lines }, { data: clients }, { data: company }] =
    await Promise.all([
      supabase
        .from("quote_lines")
        .select("*")
        .eq("quote_id", id)
        .order("line_no"),
      supabase.from("clients").select("id, name").order("name"),
      supabase
        .from("companies")
        .select("id")
        .eq("profile_id", user!.id)
        .maybeSingle(),
    ]);

  const editorLines: QuoteEditorLine[] = (lines ?? []).map((l) => ({
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
          href="/devis"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <IconArrowLeft size={16} aria-hidden /> Devis
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
          Nouveau devis
        </h1>
      </header>

      <Card>
        <CardBody>
          <QuoteEditor
            quoteId={id}
            clients={clients ?? []}
            companyConfigured={Boolean(company)}
            initial={{
              clientId: quote.client_id,
              category: quote.category,
              validUntil: quote.valid_until,
              currency: quote.currency,
              lines: editorLines,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
