import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invoicesToCsv, type InvoiceCsvRow } from "@/lib/exports/csv";
import type { InvoiceStatus } from "@/lib/supabase/database.types";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  issued: "Émise",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

/** Export comptable CSV des factures émises pour une année. */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const yearParam = request.nextUrl.searchParams.get("year");
  const year = Number(yearParam) || new Date().getFullYear();

  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "number, status, line_total, tax_total, grand_total, issue_date, paid_at, client_id",
    )
    .neq("status", "draft")
    .gte("issue_date", `${year}-01-01`)
    .lte("issue_date", `${year}-12-31`)
    .order("issue_date");

  const clientIds = [
    ...new Set((invoices ?? []).map((i) => i.client_id).filter(Boolean)),
  ] as string[];
  const clientMap = new Map<string, { name: string; siren: string | null }>();
  if (clientIds.length) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, siren")
      .in("id", clientIds);
    for (const c of clients ?? [])
      clientMap.set(c.id, { name: c.name, siren: c.siren });
  }

  const rows: InvoiceCsvRow[] = (invoices ?? []).map((i) => {
    const c = i.client_id ? clientMap.get(i.client_id) : undefined;
    return {
      issueDate: i.issue_date,
      number: i.number,
      clientName: c?.name ?? "",
      clientSiren: c?.siren ?? null,
      lineTotal: Number(i.line_total),
      taxTotal: Number(i.tax_total),
      grandTotal: Number(i.grand_total),
      status: STATUS_LABEL[i.status],
      paidAt: i.paid_at,
    };
  });

  // BOM UTF-8 pour qu'Excel reconnaisse l'encodage.
  const csv = "﻿" + invoicesToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factura-export-${year}.csv"`,
    },
  });
}
