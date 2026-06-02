"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeInvoiceTotals, round2 } from "./totals";
import { generateFacturX, type FacturXData } from "./factur-x";
import {
  invoiceDraftSchema,
  type IssueResult,
  type SaveDraftResult,
} from "./schemas";

/** Crée un brouillon vide et redirige vers son éditeur. */
export async function createDraft() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("invoices")
    .insert({ profile_id: user.id, category: "services", status: "draft" })
    .select("id")
    .single();
  if (error || !data) throw new Error("Création du brouillon impossible.");

  redirect(`/invoices/${data.id}/edit`);
}

/** Enregistre un brouillon (champs + lignes), recalcule les totaux. */
export async function saveDraft(
  id: string,
  raw: unknown,
): Promise<SaveDraftResult> {
  const parsed = invoiceDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!invoice) return { ok: false, error: "Facture introuvable." };
  if (invoice.status !== "draft") {
    return { ok: false, error: "Facture déjà émise (non modifiable)." };
  }

  const totals = computeInvoiceTotals(
    input.lines.map((l) => ({
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      vatRate: l.vatRate,
      vatCategory: l.vatCategory,
    })),
  );

  const { error: upErr } = await supabase
    .from("invoices")
    .update({
      client_id: input.clientId,
      category: input.category,
      due_date: input.dueDate,
      currency: input.currency,
      vat_on_debits: input.vatOnDebits,
      line_total: totals.lineTotal,
      tax_total: totals.taxTotal,
      grand_total: totals.grandTotal,
    })
    .eq("id", id)
    .eq("profile_id", user.id);
  if (upErr) return { ok: false, error: "Échec de l'enregistrement." };

  // Remplacement intégral des lignes.
  await supabase.from("invoice_lines").delete().eq("invoice_id", id);
  if (input.lines.length > 0) {
    const rows = input.lines.map((l, i) => ({
      invoice_id: id,
      line_no: i + 1,
      description: l.description,
      quantity: l.quantity,
      unit_code: l.unitCode,
      unit_price: l.unitPrice,
      vat_rate: l.vatRate,
      vat_category: l.vatCategory,
      line_total: round2(l.quantity * l.unitPrice),
    }));
    const { error: linesErr } = await supabase
      .from("invoice_lines")
      .insert(rows);
    if (linesErr)
      return { ok: false, error: "Échec d'enregistrement des lignes." };
  }

  revalidatePath(`/invoices/${id}/edit`);
  return { ok: true, id };
}

/** Supprime un brouillon (les factures émises sont conservées 10 ans). */
export async function deleteInvoice(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("profile_id", user.id)
    .eq("status", "draft");

  revalidatePath("/invoices");
  redirect("/invoices");
}

type Addr = {
  line1?: string | null;
  line2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country: string;
};

/** Émet la facture : numéro, snapshot, génération Factur-X, archivage, hash. */
export async function issueInvoice(id: string): Promise<IssueResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!invoice) return { ok: false, error: "Facture introuvable." };
  if (invoice.status !== "draft") {
    return { ok: false, error: "Facture déjà émise." };
  }
  if (!invoice.client_id) {
    return { ok: false, error: "Sélectionnez un client avant d'émettre." };
  }

  const { data: lines } = await supabase
    .from("invoice_lines")
    .select("*")
    .eq("invoice_id", id)
    .order("line_no");
  if (!lines || lines.length === 0) {
    return { ok: false, error: "Ajoutez au moins une ligne." };
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!company) {
    return { ok: false, error: "Configurez votre entreprise avant d'émettre." };
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", invoice.client_id)
    .maybeSingle();
  if (!client) return { ok: false, error: "Client introuvable." };

  const totals = computeInvoiceTotals(
    lines.map((l) => ({
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
      vatRate: Number(l.vat_rate),
      vatCategory: l.vat_category,
    })),
  );

  const sellerAddr: Addr = {
    line1: company.address_line1,
    line2: company.address_line2,
    postalCode: company.postal_code,
    city: company.city,
    country: company.country,
  };
  const buyerAddr: Addr = {
    line1: client.address_line1,
    line2: client.address_line2,
    postalCode: client.postal_code,
    city: client.city,
    country: client.country,
  };

  const sellerSnapshot = {
    name: company.legal_name,
    siren: company.siren,
    vatNumber: company.vat_number,
    iban: company.iban,
    address: sellerAddr,
  };
  const buyerSnapshot = {
    name: client.name,
    siren: client.siren,
    vatNumber: client.vat_number,
    address: buyerAddr,
  };

  // Allocation du numéro (atomique, après validation des prérequis).
  const year = new Date().getFullYear();
  const { data: seq, error: seqErr } = await supabase.rpc(
    "next_invoice_number",
    { p_year: year },
  );
  if (seqErr || seq == null) {
    return { ok: false, error: "Attribution du numéro impossible." };
  }
  const number = `FACT-${year}-${String(seq).padStart(4, "0")}`;
  const issueDate = new Date().toISOString().slice(0, 10);

  const facturx: FacturXData = {
    number,
    issueDate,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    seller: {
      name: company.legal_name,
      siren: company.siren,
      vatNumber: company.vat_number,
      address: sellerAddr,
    },
    buyer: {
      name: client.name,
      siren: client.siren,
      vatNumber: client.vat_number,
      address: buyerAddr,
    },
    deliveryDate: issueDate,
    lines: lines.map((l) => ({
      id: String(l.line_no),
      name: l.description,
      quantity: Number(l.quantity),
      unitCode: l.unit_code,
      unitPrice: Number(l.unit_price),
      vatRatePercent: Number(l.vat_rate),
      vatCategory: l.vat_category,
      lineTotal: Number(l.line_total),
    })),
    totals: {
      lineTotal: totals.lineTotal,
      taxBasisTotal: totals.taxBasisTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      duePayableAmount: totals.grandTotal,
    },
    vatBreakdown: totals.vatBreakdown,
    payment: company.iban ? { meansCode: "58", iban: company.iban } : undefined,
  };

  let pdf: Uint8Array;
  let xml: string;
  try {
    ({ pdf, xml } = await generateFacturX(facturx));
  } catch {
    return { ok: false, error: "Échec de la génération Factur-X." };
  }

  const sha256 = createHash("sha256").update(Buffer.from(pdf)).digest("hex");
  const base = `${user.id}/${id}`;

  const upPdf = await supabase.storage
    .from("invoices")
    .upload(`${base}.pdf`, Buffer.from(pdf), {
      contentType: "application/pdf",
      upsert: false,
    });
  if (upPdf.error) {
    return { ok: false, error: "Échec de l'archivage du PDF." };
  }
  await supabase.storage
    .from("invoices")
    .upload(`${base}.xml`, Buffer.from(xml), {
      contentType: "application/xml",
      upsert: false,
    });

  const { error: updErr } = await supabase
    .from("invoices")
    .update({
      number,
      status: "issued",
      issue_date: issueDate,
      issued_at: new Date().toISOString(),
      line_total: totals.lineTotal,
      tax_total: totals.taxTotal,
      grand_total: totals.grandTotal,
      seller_snapshot: sellerSnapshot,
      buyer_snapshot: buyerSnapshot,
      pdf_path: `${base}.pdf`,
      xml_path: `${base}.xml`,
      sha256,
    })
    .eq("id", id)
    .eq("profile_id", user.id);
  if (updErr) return { ok: false, error: "Échec de la finalisation." };

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  return { ok: true };
}

/** Génère une URL signée de téléchargement (PDF ou XML). */
export async function getInvoiceDownloadUrl(
  id: string,
  kind: "pdf" | "xml",
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("pdf_path, xml_path")
    .eq("id", id)
    .maybeSingle();
  const path = kind === "pdf" ? invoice?.pdf_path : invoice?.xml_path;
  if (!path) return null;

  const { data } = await supabase.storage
    .from("invoices")
    .createSignedUrl(path, 120);
  return data?.signedUrl ?? null;
}

/** Marque une facture comme payée (manuel). */
export async function markInvoicePaid(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", user.id)
    .in("status", ["issued", "sent", "overdue"]);

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
}
