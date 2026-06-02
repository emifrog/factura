import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderQuotePdf } from "@/lib/quotes/pdf";
import { buildQuotePdfData } from "@/lib/quotes/pdf-data";

/** Téléchargement du PDF d'un devis par son propriétaire (RLS). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!quote) return new NextResponse("Not found", { status: 404 });

  const [{ data: company }, { data: client }, { data: lines }] =
    await Promise.all([
      supabase
        .from("companies")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle(),
      quote.client_id
        ? supabase
            .from("clients")
            .select("*")
            .eq("id", quote.client_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("quote_lines")
        .select("*")
        .eq("quote_id", id)
        .order("line_no"),
    ]);

  const pdf = await renderQuotePdf(
    buildQuotePdfData(quote, company, client, lines ?? []),
  );

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.number ?? "devis"}.pdf"`,
    },
  });
}
