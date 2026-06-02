/** Génération CSV pour export comptable — pur, testable. */

export type InvoiceCsvRow = {
  issueDate: string | null;
  number: string | null;
  clientName: string;
  clientSiren: string | null;
  lineTotal: number;
  taxTotal: number;
  grandTotal: number;
  status: string;
  paidAt: string | null;
};

const HEADERS = [
  "Date",
  "Numéro",
  "Client",
  "SIREN client",
  "Total HT",
  "TVA",
  "Total TTC",
  "Statut",
  "Payée le",
];

/** Échappe une valeur CSV (délimiteur `;`). */
function esc(value: string): string {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Montant en notation française (virgule décimale) pour Excel FR. */
function amount(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

/** Construit un CSV (séparateur `;`, décimale `,`) des factures fournies. */
export function invoicesToCsv(rows: InvoiceCsvRow[]): string {
  const lines = [HEADERS.join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.issueDate ?? "",
        r.number ?? "",
        r.clientName,
        r.clientSiren ?? "",
        amount(r.lineTotal),
        amount(r.taxTotal),
        amount(r.grandTotal),
        r.status,
        r.paidAt ? r.paidAt.slice(0, 10) : "",
      ]
        .map((v) => esc(String(v)))
        .join(";"),
    );
  }
  return lines.join("\r\n");
}
