/** Calculs de totaux de facture — pur, sans I/O, testable. */

export type TotalsLineInput = {
  quantity: number;
  unitPrice: number;
  vatRate: number; // pourcentage, ex. 20
  vatCategory: string; // S, Z, E…
};

export type VatBreakdownLine = {
  categoryCode: string;
  ratePercent: number;
  taxableAmount: number;
  taxAmount: number;
};

export type InvoiceTotals = {
  lineTotal: number;
  taxBasisTotal: number;
  taxTotal: number;
  grandTotal: number;
  vatBreakdown: VatBreakdownLine[];
};

/** Arrondi commercial à 2 décimales. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Total HT d'une ligne (arrondi à la ligne — BR-CO-17). */
export function lineNet(line: TotalsLineInput): number {
  return round2(line.quantity * line.unitPrice);
}

/**
 * Calcule les totaux d'une facture.
 * BR-CO-17 : chaque ligne est arrondie avant sommation ; la TVA est regroupée
 * par couple (catégorie, taux).
 */
export function computeInvoiceTotals(lines: TotalsLineInput[]): InvoiceTotals {
  const nets = lines.map(lineNet);
  const lineTotal = round2(nets.reduce((a, b) => a + b, 0));

  const groups = new Map<string, VatBreakdownLine>();
  lines.forEach((l, i) => {
    const key = `${l.vatCategory}:${l.vatRate}`;
    const g = groups.get(key) ?? {
      categoryCode: l.vatCategory,
      ratePercent: l.vatRate,
      taxableAmount: 0,
      taxAmount: 0,
    };
    g.taxableAmount = round2(g.taxableAmount + nets[i]!);
    groups.set(key, g);
  });

  const vatBreakdown = [...groups.values()].map((g) => ({
    ...g,
    taxAmount: round2((g.taxableAmount * g.ratePercent) / 100),
  }));

  const taxTotal = round2(vatBreakdown.reduce((a, b) => a + b.taxAmount, 0));
  const taxBasisTotal = lineTotal;
  const grandTotal = round2(taxBasisTotal + taxTotal);

  return { lineTotal, taxBasisTotal, taxTotal, grandTotal, vatBreakdown };
}
