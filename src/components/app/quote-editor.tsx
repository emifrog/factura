"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconPlus,
  IconTrash,
  IconSend,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { saveQuoteDraft, finalizeQuote } from "@/lib/quotes/actions";
import { computeInvoiceTotals } from "@/lib/invoices/totals";
import type { InvoiceCategory } from "@/lib/supabase/database.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "services", label: "Prestation de services" },
  { value: "goods", label: "Livraison de biens" },
  { value: "mixed", label: "Mixte (biens + services)" },
];

const VAT_RATES = [
  { value: "20", label: "20 %" },
  { value: "10", label: "10 %" },
  { value: "5.5", label: "5,5 %" },
  { value: "2.1", label: "2,1 %" },
  { value: "0", label: "0 % (franchise / exonéré)" },
];

export type QuoteEditorLine = {
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  unitCode: string;
};

const emptyLine: QuoteEditorLine = {
  description: "",
  quantity: "1",
  unitPrice: "0",
  vatRate: "20",
  unitCode: "C62",
};

function fmt(n: number, currency: string) {
  return `${n.toFixed(2)} ${currency}`;
}

export function QuoteEditor({
  quoteId,
  clients,
  companyConfigured,
  initial,
}: {
  quoteId: string;
  clients: { id: string; name: string }[];
  companyConfigured: boolean;
  initial: {
    clientId: string | null;
    category: InvoiceCategory;
    validUntil: string | null;
    currency: string;
    lines: QuoteEditorLine[];
  };
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(initial.clientId ?? "");
  const [category, setCategory] = useState<InvoiceCategory>(initial.category);
  const [validUntil, setValidUntil] = useState(initial.validUntil ?? "");
  const [lines, setLines] = useState<QuoteEditorLine[]>(
    initial.lines.length ? initial.lines : [emptyLine],
  );
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isFinalizing, startFinalize] = useTransition();

  const currency = initial.currency || "EUR";

  const totals = useMemo(
    () =>
      computeInvoiceTotals(
        lines.map((l) => ({
          quantity: Number(l.quantity) || 0,
          unitPrice: Number(l.unitPrice) || 0,
          vatRate: Number(l.vatRate) || 0,
          vatCategory: Number(l.vatRate) > 0 ? "S" : "E",
        })),
      ),
    [lines],
  );

  const setLine = (i: number, key: keyof QuoteEditorLine, value: string) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [key]: value } : l)));
  const addLine = () => setLines((ls) => [...ls, { ...emptyLine }]);
  const removeLine = (i: number) =>
    setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls));

  const payload = () => ({
    clientId: clientId || null,
    category,
    validUntil: validUntil || null,
    currency,
    lines: lines.map((l) => ({
      description: l.description,
      quantity: Number(l.quantity) || 0,
      unitPrice: Number(l.unitPrice) || 0,
      vatRate: Number(l.vatRate) || 0,
      unitCode: l.unitCode,
      vatCategory: Number(l.vatRate) > 0 ? "S" : "E",
    })),
  });

  function handleSave() {
    setError(null);
    setFeedback(null);
    startSave(async () => {
      const res = await saveQuoteDraft(quoteId, payload());
      if (res.ok) setFeedback("Brouillon enregistré.");
      else setError(res.error);
    });
  }

  function handleFinalize() {
    setError(null);
    setFeedback(null);
    startFinalize(async () => {
      const saved = await saveQuoteDraft(quoteId, payload());
      if (!saved.ok) {
        setError(saved.error);
        return;
      }
      const res = await finalizeQuote(quoteId);
      if (res.ok) router.push(`/devis/${quoteId}`);
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {!companyConfigured && (
        <div className="rounded-md border border-danger-surface bg-danger/5 px-4 py-3 text-sm text-danger-strong">
          Configurez votre entreprise avant de finaliser un devis.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Select
          label="Client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          options={[
            { value: "", label: "— Sélectionner —" },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          label="Catégorie d'opération"
          value={category}
          onChange={(e) => setCategory(e.target.value as InvoiceCategory)}
          options={CATEGORIES}
        />
        <Input
          label="Valable jusqu'au"
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
            Lignes
          </span>
          <Button type="button" variant="secondary" size="sm" onClick={addLine}>
            <IconPlus size={14} aria-hidden /> Ajouter
          </Button>
        </div>

        {lines.map((l, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-3 rounded-md border border-border p-3 sm:grid-cols-12 sm:items-end"
          >
            <div className="sm:col-span-5">
              <Input
                label={i === 0 ? "Description" : undefined}
                value={l.description}
                onChange={(e) => setLine(i, "description", e.target.value)}
                placeholder="Prestation…"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label={i === 0 ? "Qté" : undefined}
                type="number"
                inputMode="decimal"
                value={l.quantity}
                onChange={(e) => setLine(i, "quantity", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label={i === 0 ? "PU HT" : undefined}
                type="number"
                inputMode="decimal"
                value={l.unitPrice}
                onChange={(e) => setLine(i, "unitPrice", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                label={i === 0 ? "TVA" : undefined}
                value={l.vatRate}
                onChange={(e) => setLine(i, "vatRate", e.target.value)}
                options={VAT_RATES}
              />
            </div>
            <div className="flex items-center justify-end sm:col-span-1">
              <button
                type="button"
                onClick={() => removeLine(i)}
                aria-label="Supprimer la ligne"
                className="rounded-md p-2 text-ink-subtle hover:text-danger-strong"
              >
                <IconTrash size={16} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>Total HT</span>
            <span className="tnum">{fmt(totals.lineTotal, currency)}</span>
          </div>
          <div className="flex justify-between text-ink-muted">
            <span>TVA</span>
            <span className="tnum">{fmt(totals.taxTotal, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-semibold text-ink">
            <span>Total TTC</span>
            <span className="tnum">{fmt(totals.grandTotal, currency)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-danger-strong">{error}</p>}
      {feedback && <p className="text-sm text-success">{feedback}</p>}

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={handleSave}
          disabled={isSaving || isFinalizing}
        >
          <IconDeviceFloppy size={16} aria-hidden />
          {isSaving ? "Enregistrement…" : "Enregistrer le brouillon"}
        </Button>
        <Button
          type="button"
          variant="success"
          onClick={handleFinalize}
          disabled={isFinalizing || isSaving || !companyConfigured}
        >
          <IconSend size={16} aria-hidden />
          {isFinalizing ? "Finalisation…" : "Finaliser le devis"}
        </Button>
      </div>
    </div>
  );
}
