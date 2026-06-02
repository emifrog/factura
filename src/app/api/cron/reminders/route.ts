import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dueReminderStages, daysSince } from "@/lib/invoices/reminders";
import { isEmailConfigured, sendInvoiceReminder } from "@/lib/email/resend";

export const runtime = "nodejs";

/**
 * Cron quotidien (Vercel) : passe les factures échues en `overdue` et envoie
 * les relances dues (J+7/15/30) via Resend. Sécurisé par CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, profile_id, number, grand_total, currency, due_date, client_id, status",
    )
    .in("status", ["issued", "sent", "overdue"])
    .not("due_date", "is", null)
    .lt("due_date", today);

  if (!invoices || invoices.length === 0) {
    return NextResponse.json({ overdue: 0, reminders: 0 });
  }

  // Préchargement entreprises + clients.
  const profileIds = [...new Set(invoices.map((i) => i.profile_id))];
  const clientIds = [
    ...new Set(invoices.map((i) => i.client_id).filter(Boolean)),
  ] as string[];

  const [{ data: companies }, { data: clients }, { data: reminders }] =
    await Promise.all([
      supabase
        .from("companies")
        .select("profile_id, legal_name, reminder_enabled, reminder_signature")
        .in("profile_id", profileIds),
      clientIds.length
        ? supabase.from("clients").select("id, email").in("id", clientIds)
        : Promise.resolve({
            data: [] as { id: string; email: string | null }[],
          }),
      supabase
        .from("invoice_reminders")
        .select("invoice_id, stage")
        .in(
          "invoice_id",
          invoices.map((i) => i.id),
        ),
    ]);

  const companyByProfile = new Map(
    (companies ?? []).map((c) => [c.profile_id, c]),
  );
  const emailByClient = new Map((clients ?? []).map((c) => [c.id, c.email]));
  const sentByInvoice = new Map<string, number[]>();
  for (const r of reminders ?? []) {
    sentByInvoice.set(r.invoice_id, [
      ...(sentByInvoice.get(r.invoice_id) ?? []),
      r.stage,
    ]);
  }

  const emailReady = isEmailConfigured();
  let overdueCount = 0;
  let reminderCount = 0;

  for (const inv of invoices) {
    const daysOverdue = daysSince(inv.due_date!, now);
    if (daysOverdue < 1) continue;

    if (inv.status !== "overdue") {
      await supabase
        .from("invoices")
        .update({ status: "overdue" })
        .eq("id", inv.id);
      overdueCount++;
    }

    if (!emailReady) continue;
    const company = companyByProfile.get(inv.profile_id);
    if (!company?.reminder_enabled) continue;
    const email = inv.client_id ? emailByClient.get(inv.client_id) : null;
    if (!email) continue;

    const stages = dueReminderStages(
      daysOverdue,
      sentByInvoice.get(inv.id) ?? [],
    );
    for (const stage of stages) {
      try {
        await sendInvoiceReminder(email, {
          invoiceNumber: inv.number ?? "—",
          amount: `${Number(inv.grand_total).toFixed(2)} ${inv.currency}`,
          dueDate: inv.due_date!,
          stage,
          sellerName: company.legal_name,
          signature: company.reminder_signature,
        });
        await supabase
          .from("invoice_reminders")
          .upsert(
            { invoice_id: inv.id, stage },
            { onConflict: "invoice_id,stage", ignoreDuplicates: true },
          );
        reminderCount++;
      } catch {
        // Échec d'envoi : on n'enregistre pas → retenté au prochain cron.
      }
    }
  }

  return NextResponse.json({
    overdue: overdueCount,
    reminders: reminderCount,
  });
}
