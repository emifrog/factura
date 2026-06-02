import type { QuotePdfData } from "./pdf";

type QuoteRow = {
  number: string | null;
  issue_date: string | null;
  valid_until: string | null;
  currency: string;
  line_total: number;
  tax_total: number;
  grand_total: number;
};

type CompanyRow = {
  legal_name: string;
  siren: string | null;
  vat_number: string | null;
  address_line1: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
} | null;

type ClientRow = {
  name: string;
  siren: string | null;
  vat_number: string | null;
  address_line1: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
} | null;

type LineRow = {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

/** Mappe les lignes DB d'un devis vers les données de rendu PDF. */
export function buildQuotePdfData(
  quote: QuoteRow,
  company: CompanyRow,
  client: ClientRow,
  lines: LineRow[],
): QuotePdfData {
  return {
    number: quote.number ?? "DEVIS",
    issueDate: quote.issue_date ?? "",
    validUntil: quote.valid_until,
    currency: quote.currency,
    seller: {
      name: company?.legal_name ?? "",
      siren: company?.siren,
      vatNumber: company?.vat_number,
      address: {
        line1: company?.address_line1,
        postalCode: company?.postal_code,
        city: company?.city,
        country: company?.country ?? "FR",
      },
    },
    buyer: {
      name: client?.name ?? "",
      siren: client?.siren,
      vatNumber: client?.vat_number,
      address: {
        line1: client?.address_line1,
        postalCode: client?.postal_code,
        city: client?.city,
        country: client?.country ?? "FR",
      },
    },
    lines: lines.map((l) => ({
      name: l.description,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
      lineTotal: Number(l.line_total),
    })),
    totals: {
      lineTotal: Number(quote.line_total),
      taxTotal: Number(quote.tax_total),
      grandTotal: Number(quote.grand_total),
    },
  };
}
