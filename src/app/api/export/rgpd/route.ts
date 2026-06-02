import { NextResponse } from "next/server";
import { zipSync, strToU8 } from "fflate";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Export RGPD complet : toutes les données utilisateur (JSON) + PDFs archivés. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const [profile, company, clients, invoices, quotes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("companies")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase.from("clients").select("*").eq("profile_id", user.id),
    supabase.from("invoices").select("*").eq("profile_id", user.id),
    supabase.from("quotes").select("*").eq("profile_id", user.id),
  ]);

  const invoiceIds = (invoices.data ?? []).map((i) => i.id);
  const quoteIds = (quotes.data ?? []).map((q) => q.id);

  const [invoiceLines, quoteLines] = await Promise.all([
    invoiceIds.length
      ? supabase.from("invoice_lines").select("*").in("invoice_id", invoiceIds)
      : Promise.resolve({ data: [] }),
    quoteIds.length
      ? supabase.from("quote_lines").select("*").in("quote_id", quoteIds)
      : Promise.resolve({ data: [] }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    company: company.data,
    clients: clients.data ?? [],
    invoices: invoices.data ?? [],
    invoiceLines: invoiceLines.data ?? [],
    quotes: quotes.data ?? [],
    quoteLines: quoteLines.data ?? [],
  };

  const files: Record<string, Uint8Array> = {
    "donnees.json": strToU8(JSON.stringify(data, null, 2)),
  };

  // PDFs Factur-X archivés.
  for (const inv of invoices.data ?? []) {
    if (!inv.pdf_path) continue;
    const { data: file } = await supabase.storage
      .from("invoices")
      .download(inv.pdf_path);
    if (file) {
      const buf = new Uint8Array(await file.arrayBuffer());
      files[`factures/${inv.number ?? inv.id}.pdf`] = buf;
    }
  }

  const zip = zipSync(files, { level: 6 });

  return new NextResponse(Buffer.from(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="factura-mes-donnees.zip"`,
    },
  });
}
