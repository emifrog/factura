import "server-only";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export type QuotePdfParty = {
  name: string;
  siren?: string | null;
  vatNumber?: string | null;
  address: {
    line1?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country: string;
  };
};

export type QuotePdfData = {
  number: string;
  issueDate: string;
  validUntil?: string | null;
  currency: string;
  seller: QuotePdfParty;
  buyer: QuotePdfParty;
  lines: {
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  totals: { lineTotal: number; taxTotal: number; grandTotal: number };
};

const INK = rgb(0.098, 0.11, 0.118);
const MUTED = rgb(0.27, 0.275, 0.302);

let fontCache: Buffer | null = null;
function loadFont() {
  fontCache ??= readFileSync(
    fileURLToPath(
      new URL("../invoices/assets/NotoSans-Regular.ttf", import.meta.url),
    ),
  );
  return fontCache;
}

function money(n: number, currency: string) {
  return `${n.toFixed(2)} ${currency}`;
}

export async function renderQuotePdf(data: QuotePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(loadFont(), { subset: true });
  const page = doc.addPage([595.28, 841.89]);
  const { width } = page.getSize();
  let y = 800;

  const right = (s: string, size = 10, color = INK) => {
    const w = font.widthOfTextAtSize(s, size);
    page.drawText(s, { x: width - 40 - w, y, size, font, color });
  };

  page.drawText("DEVIS", { x: 40, y, size: 22, font, color: INK });
  right(data.number, 12);
  y -= 18;
  right(`Établi le ${data.issueDate}`, 9, MUTED);
  if (data.validUntil) {
    y -= 12;
    right(`Valable jusqu'au ${data.validUntil}`, 9, MUTED);
  }
  y -= 28;

  const party = (p: QuotePdfParty, x: number, label: string) => {
    let yy = y;
    const line = (s: string, size = 9, color = MUTED) => {
      page.drawText(s, { x, y: yy, size, font, color });
      yy -= 13;
    };
    line(label, 8, MUTED);
    line(p.name, 11, INK);
    if (p.siren) line(`SIREN ${p.siren}`);
    if (p.vatNumber) line(`TVA ${p.vatNumber}`);
    if (p.address.line1) line(p.address.line1);
    const cityLine = [p.address.postalCode, p.address.city]
      .filter(Boolean)
      .join(" ");
    if (cityLine) line(cityLine);
    line(p.address.country);
    return yy;
  };
  const yl = party(data.seller, 40, "ÉMETTEUR");
  const yr = party(data.buyer, 320, "CLIENT");
  y = Math.min(yl, yr) - 20;

  const row = (
    cells: [string, string, string, string],
    size = 9,
    color = INK,
  ) => {
    page.drawText(cells[0], { x: 40, y, size, font, color });
    page.drawText(cells[1], { x: 360, y, size, font, color });
    page.drawText(cells[2], { x: 420, y, size, font, color });
    const w = font.widthOfTextAtSize(cells[3], size);
    page.drawText(cells[3], { x: width - 40 - w, y, size, font, color });
    y -= 16;
  };
  row(["Description", "Qté", "PU HT", "Total HT"], 8, MUTED);
  page.drawLine({
    start: { x: 40, y: y + 8 },
    end: { x: width - 40, y: y + 8 },
    thickness: 0.5,
    color: MUTED,
  });
  y -= 4;
  for (const l of data.lines) {
    row([
      l.name.slice(0, 60),
      String(l.quantity),
      money(l.unitPrice, data.currency),
      money(l.lineTotal, data.currency),
    ]);
  }

  y -= 10;
  const total = (label: string, value: string, bold = false) => {
    page.drawText(label, { x: 360, y, size: bold ? 11 : 9, font, color: INK });
    const w = font.widthOfTextAtSize(value, bold ? 11 : 9);
    page.drawText(value, {
      x: width - 40 - w,
      y,
      size: bold ? 11 : 9,
      font,
      color: INK,
    });
    y -= 16;
  };
  total("Total HT", money(data.totals.lineTotal, data.currency));
  total("TVA", money(data.totals.taxTotal, data.currency));
  total("Total TTC", money(data.totals.grandTotal, data.currency), true);

  y -= 14;
  page.drawText("Devis sans valeur de facture. Bon pour accord requis.", {
    x: 40,
    y,
    size: 8,
    font,
    color: MUTED,
  });

  return doc.save();
}
