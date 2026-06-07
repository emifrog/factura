import "server-only";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  embedFacturX,
  DocumentTypeCode,
  Profile,
  Flavor,
} from "@stackforge-eu/factur-x";

/** Partie (vendeur ou acheteur) normalisée. */
export type FacturXParty = {
  name: string;
  siren?: string | null;
  vatNumber?: string | null;
  email?: string | null;
  address: {
    line1?: string | null;
    line2?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country: string;
  };
};

export type FacturXLineData = {
  id: string;
  name: string;
  quantity: number;
  unitCode: string;
  unitPrice: number;
  vatRatePercent: number;
  vatCategory: string;
  lineTotal: number;
};

export type DeliveryAddress = {
  line1?: string | null;
  line2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
};

export type FacturXData = {
  number: string;
  issueDate: string; // YYYY-MM-DD
  dueDate?: string | null;
  currency: string;
  category: "goods" | "services" | "mixed";
  vatOnDebits: boolean;
  seller: FacturXParty;
  buyer: FacturXParty;
  deliveryDate?: string | null;
  deliveryAddress?: DeliveryAddress | null;
  lines: FacturXLineData[];
  totals: {
    lineTotal: number;
    taxBasisTotal: number;
    taxTotal: number;
    grandTotal: number;
    duePayableAmount: number;
  };
  vatBreakdown: {
    categoryCode: string;
    ratePercent: number;
    taxableAmount: number;
    taxAmount: number;
  }[];
  payment?: { meansCode?: string; iban?: string | null };
};

// Assets embarqués (tracés pour le serverless via next.config outputFileTracingIncludes).
// Chargés paresseusement : éviter une lecture fs à l'évaluation du module
// (sinon échec à la collecte de build Next).
let fontBytesCache: Buffer | null = null;
let iccBytesCache: Buffer | null = null;

function loadAssets() {
  fontBytesCache ??= readFileSync(
    fileURLToPath(new URL("./assets/NotoSans-Regular.ttf", import.meta.url)),
  );
  iccBytesCache ??= readFileSync(
    fileURLToPath(new URL("./assets/sRGB-v2-micro.icc", import.meta.url)),
  );
  return { font: fontBytesCache, icc: iccBytesCache };
}

const INK = rgb(0.098, 0.11, 0.118);
const MUTED = rgb(0.27, 0.275, 0.302);

const CATEGORY_LABEL: Record<FacturXData["category"], string> = {
  goods: "Livraison de biens",
  services: "Prestation de services",
  mixed: "Opération mixte (biens et services)",
};

function hasDeliveryAddress(a?: DeliveryAddress | null): a is DeliveryAddress {
  return Boolean(a && (a.line1 || a.city || a.postalCode));
}

/** Mappe une partie vers l'input lib (SIREN en BT-30 + adresse électronique). */
function mapParty(p: FacturXParty) {
  // Schéma 0002 = SIREN (ISO 6523) ; EM = adresse électronique de type email.
  const endpoint = p.email
    ? { value: p.email, schemeID: "EM" }
    : p.siren
      ? { value: p.siren, schemeID: "0002" }
      : undefined;
  return {
    name: p.name,
    ...(p.siren ? { id: p.siren } : {}),
    address: {
      line1: p.address.line1 ?? "",
      city: p.address.city ?? "",
      postalCode: p.address.postalCode ?? "",
      country: p.address.country,
    },
    ...(p.siren
      ? { legalOrganization: { id: p.siren, schemeID: "0002" } }
      : {}),
    ...(endpoint ? { electronicAddress: endpoint } : {}),
    ...(p.vatNumber
      ? { taxRegistrations: [{ id: p.vatNumber, schemeId: "VA" as const }] }
      : {}),
  };
}

/** Mentions FR obligatoires (BG-1) sous forme de notes document. */
function buildNotes(data: FacturXData) {
  return [
    { content: `Catégorie de l'opération : ${CATEGORY_LABEL[data.category]}` },
    ...(data.vatOnDebits
      ? [{ content: "TVA acquittée d'après les débits." }]
      : []),
    // Mentions légales françaises obligatoires (codes PMT / PMD / AAB).
    {
      subjectCode: "PMT",
      content: "Indemnité forfaitaire pour frais de recouvrement : 40 €.",
    },
    {
      subjectCode: "PMD",
      content:
        "Tout retard de paiement entraîne des pénalités au taux de 3 fois le taux d'intérêt légal.",
    },
    { subjectCode: "AAB", content: "Pas d'escompte pour paiement anticipé." },
  ];
}

function money(n: number, currency: string) {
  return `${n.toFixed(2)} ${currency}`;
}

/** Construit un PDF lisible (police embarquée — requis PDF/A-3). */
async function renderBasePdf(data: FacturXData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(loadAssets().font, { subset: true });
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();
  let y = 800;

  const text = (
    s: string,
    x: number,
    size = 10,
    color = INK,
    f: PDFFont = font,
  ) => page.drawText(s, { x, y, size, font: f, color });

  const right = (s: string, size = 10, color = INK) => {
    const w = font.widthOfTextAtSize(s, size);
    page.drawText(s, { x: width - 40 - w, y, size, font, color });
  };

  // En-tête
  text("FACTURE", 40, 22);
  right(data.number, 12);
  y -= 18;
  right(`Émise le ${data.issueDate}`, 9, MUTED);
  if (data.dueDate) {
    y -= 12;
    right(`Échéance ${data.dueDate}`, 9, MUTED);
  }
  y -= 28;

  // Vendeur / acheteur
  const party = (p: FacturXParty, x: number, label: string) => {
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
  const yLeft = party(data.seller, 40, "VENDEUR");
  const yRight = party(data.buyer, 320, "CLIENT");
  y = Math.min(yLeft, yRight) - 20;

  // Tableau des lignes
  const drawRow = (
    cells: [string, string, string, string],
    size = 9,
    color = INK,
  ) => {
    const [desc, qty, pu, tot] = cells;
    page.drawText(desc, { x: 40, y, size, font, color });
    page.drawText(qty, { x: 360, y, size, font, color });
    page.drawText(pu, { x: 420, y, size, font, color });
    const w = font.widthOfTextAtSize(tot, size);
    page.drawText(tot, { x: width - 40 - w, y, size, font, color });
    y -= 16;
  };
  drawRow(["Description", "Qté", "PU HT", "Total HT"], 8, MUTED);
  page.drawLine({
    start: { x: 40, y: y + 8 },
    end: { x: width - 40, y: y + 8 },
    thickness: 0.5,
    color: MUTED,
  });
  y -= 4;
  for (const l of data.lines) {
    drawRow([
      l.name.slice(0, 60),
      String(l.quantity),
      money(l.unitPrice, data.currency),
      money(l.lineTotal, data.currency),
    ]);
  }

  // Totaux
  y -= 10;
  const totalLine = (label: string, value: string, bold = false) => {
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
  totalLine("Total HT", money(data.totals.lineTotal, data.currency));
  totalLine("TVA", money(data.totals.taxTotal, data.currency));
  totalLine("Total TTC", money(data.totals.grandTotal, data.currency), true);

  // Mentions
  y -= 14;
  const note = (s: string) => {
    page.drawText(s, { x: 40, y, size: 8, font, color: MUTED });
    y -= 11;
  };
  note(`Catégorie de l'opération : ${CATEGORY_LABEL[data.category]}`);
  if (data.vatOnDebits) note("TVA acquittée d'après les débits.");
  if (hasDeliveryAddress(data.deliveryAddress)) {
    const a = data.deliveryAddress;
    const cityLine = [a.postalCode, a.city].filter(Boolean).join(" ");
    note(
      `Adresse de livraison : ${[a.line1, cityLine, a.country]
        .filter(Boolean)
        .join(", ")}`,
    );
  }
  if (data.payment?.iban) note(`IBAN : ${data.payment.iban}`);
  note("Facture électronique conforme — format Factur-X (EN 16931).");

  return doc.save();
}

/** Génère le Factur-X complet : PDF/A-3b + XML CII EN 16931 embarqué. */
export async function generateFacturX(
  data: FacturXData,
): Promise<{ pdf: Uint8Array; xml: string }> {
  const basePdf = await renderBasePdf(data);

  const result = await embedFacturX({
    pdf: basePdf,
    rgbIccProfile: loadAssets().icc,
    profile: Profile.EN16931,
    flavor: Flavor.FACTUR_X,
    // validateBeforeEmbed (défaut) vérifie déjà les règles de profil ;
    // la conformité XSD/Schematron est validée par Mustang (gate CI).
    validateXsd: false,
    input: {
      document: {
        id: data.number,
        issueDate: data.issueDate,
        typeCode: DocumentTypeCode.COMMERCIAL_INVOICE,
        // Mentions FR sans champ EN 16931 structuré → notes document (BG-1).
        notes: buildNotes(data),
      },
      seller: mapParty(data.seller),
      buyer: mapParty(data.buyer),
      delivery:
        data.deliveryDate || hasDeliveryAddress(data.deliveryAddress)
          ? {
              ...(data.deliveryDate ? { date: data.deliveryDate } : {}),
              ...(hasDeliveryAddress(data.deliveryAddress)
                ? {
                    location: {
                      line1: data.deliveryAddress.line1 ?? "",
                      city: data.deliveryAddress.city ?? "",
                      postalCode: data.deliveryAddress.postalCode ?? "",
                      country: data.deliveryAddress.country ?? "FR",
                    },
                  }
                : {}),
            }
          : undefined,
      lines: data.lines.map((l) => ({
        id: l.id,
        name: l.name,
        quantity: l.quantity,
        unitCode: l.unitCode,
        unitPrice: l.unitPrice,
        vatCategoryCode: l.vatCategory,
        vatRatePercent: l.vatRatePercent,
      })),
      totals: {
        lineTotal: data.totals.lineTotal,
        taxBasisTotal: data.totals.taxBasisTotal,
        taxTotal: data.totals.taxTotal,
        grandTotal: data.totals.grandTotal,
        duePayableAmount: data.totals.duePayableAmount,
        currency: data.currency,
      },
      vatBreakdown: data.vatBreakdown,
      payment: data.payment?.iban
        ? {
            meansCode: data.payment.meansCode ?? "58",
            iban: data.payment.iban,
            dueDate: data.dueDate ?? undefined,
          }
        : undefined,
    },
  });

  return { pdf: result.pdf, xml: result.xml };
}
