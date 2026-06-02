"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeInvoiceTotals, round2 } from "@/lib/invoices/totals";
import {
  quoteDraftSchema,
  type FinalizeQuoteResult,
  type SaveQuoteResult,
} from "./schemas";

/** Crée un brouillon de devis et redirige vers son éditeur. */
export async function createQuoteDraft() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("quotes")
    .insert({ profile_id: user.id, category: "services", status: "draft" })
    .select("id")
    .single();
  if (error || !data) throw new Error("Création du devis impossible.");

  redirect(`/devis/${data.id}/edit`);
}

/** Enregistre un brouillon de devis (champs + lignes). */
export async function saveQuoteDraft(
  id: string,
  raw: unknown,
): Promise<SaveQuoteResult> {
  const parsed = quoteDraftSchema.safeParse(raw);
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

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!quote) return { ok: false, error: "Devis introuvable." };
  if (quote.status !== "draft") {
    return { ok: false, error: "Devis déjà finalisé (non modifiable)." };
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
    .from("quotes")
    .update({
      client_id: input.clientId,
      category: input.category,
      valid_until: input.validUntil,
      currency: input.currency,
      line_total: totals.lineTotal,
      tax_total: totals.taxTotal,
      grand_total: totals.grandTotal,
    })
    .eq("id", id)
    .eq("profile_id", user.id);
  if (upErr) return { ok: false, error: "Échec de l'enregistrement." };

  await supabase.from("quote_lines").delete().eq("quote_id", id);
  if (input.lines.length > 0) {
    const rows = input.lines.map((l, i) => ({
      quote_id: id,
      line_no: i + 1,
      description: l.description,
      quantity: l.quantity,
      unit_code: l.unitCode,
      unit_price: l.unitPrice,
      vat_rate: l.vatRate,
      vat_category: l.vatCategory,
      line_total: round2(l.quantity * l.unitPrice),
    }));
    const { error: linesErr } = await supabase.from("quote_lines").insert(rows);
    if (linesErr) return { ok: false, error: "Échec des lignes." };
  }

  revalidatePath(`/devis/${id}/edit`);
  return { ok: true, id };
}

/** Supprime un brouillon de devis. */
export async function deleteQuote(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("profile_id", user.id)
    .eq("status", "draft");

  revalidatePath("/devis");
  redirect("/devis");
}

/** Finalise le devis : numéro + date, statut "envoyé" (PDF généré à la demande). */
export async function finalizeQuote(id: string): Promise<FinalizeQuoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status, client_id")
    .eq("id", id)
    .maybeSingle();
  if (!quote) return { ok: false, error: "Devis introuvable." };
  if (quote.status !== "draft") {
    return { ok: false, error: "Devis déjà finalisé." };
  }
  if (!quote.client_id) {
    return { ok: false, error: "Sélectionnez un client avant de finaliser." };
  }

  const { count } = await supabase
    .from("quote_lines")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", id);
  if (!count) return { ok: false, error: "Ajoutez au moins une ligne." };

  const year = new Date().getFullYear();
  const { data: seq, error: seqErr } = await supabase.rpc("next_quote_number", {
    p_year: year,
  });
  if (seqErr || seq == null) {
    return { ok: false, error: "Attribution du numéro impossible." };
  }
  const number = `DEVIS-${year}-${String(seq).padStart(4, "0")}`;

  const { error: updErr } = await supabase
    .from("quotes")
    .update({
      number,
      status: "sent",
      issue_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", id)
    .eq("profile_id", user.id);
  if (updErr) return { ok: false, error: "Échec de la finalisation." };

  revalidatePath(`/devis/${id}`);
  revalidatePath("/devis");
  return { ok: true };
}

/** Transforme un devis accepté en brouillon de facture (lignes copiées). */
export async function convertQuoteToInvoice(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!quote || quote.status !== "accepted") return;

  const { data: lines } = await supabase
    .from("quote_lines")
    .select("*")
    .eq("quote_id", id)
    .order("line_no");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      profile_id: user.id,
      client_id: quote.client_id,
      category: quote.category,
      currency: quote.currency,
      status: "draft",
      line_total: quote.line_total,
      tax_total: quote.tax_total,
      grand_total: quote.grand_total,
    })
    .select("id")
    .single();
  if (error || !invoice) return;

  if (lines && lines.length > 0) {
    await supabase.from("invoice_lines").insert(
      lines.map((l) => ({
        invoice_id: invoice.id,
        line_no: l.line_no,
        description: l.description,
        quantity: l.quantity,
        unit_code: l.unit_code,
        unit_price: l.unit_price,
        vat_rate: l.vat_rate,
        vat_category: l.vat_category,
        line_total: l.line_total,
      })),
    );
  }

  redirect(`/invoices/${invoice.id}/edit`);
}
