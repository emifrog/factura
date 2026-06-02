// @vitest-environment node
import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { generateFacturX, type FacturXData } from "./factur-x";

export const sampleInvoice: FacturXData = {
  number: "FACT-2026-0001",
  issueDate: "2026-06-02",
  dueDate: "2026-07-02",
  currency: "EUR",
  seller: {
    name: "Studio Xavier R.",
    siren: "123456789",
    vatNumber: "FR40123456789",
    address: {
      line1: "4 rue de Rivoli",
      postalCode: "75001",
      city: "Paris",
      country: "FR",
    },
  },
  buyer: {
    name: "Acme Studio SAS",
    siren: "812345678",
    vatNumber: "FR12812345678",
    address: {
      line1: "10 rue de la Republique",
      postalCode: "69002",
      city: "Lyon",
      country: "FR",
    },
  },
  deliveryDate: "2026-06-02",
  lines: [
    {
      id: "1",
      name: "Developpement Next.js - sprint mai 2026",
      quantity: 12,
      unitCode: "HUR",
      unitPrice: 500,
      vatRatePercent: 20,
      vatCategory: "S",
      lineTotal: 6000,
    },
  ],
  totals: {
    lineTotal: 6000,
    taxBasisTotal: 6000,
    taxTotal: 1200,
    grandTotal: 7200,
    duePayableAmount: 7200,
  },
  vatBreakdown: [
    {
      categoryCode: "S",
      ratePercent: 20,
      taxableAmount: 6000,
      taxAmount: 1200,
    },
  ],
  payment: { meansCode: "58", iban: "FR7630006000011234567890189" },
};

describe("generateFacturX", () => {
  it("produit un PDF/A-3 + XML CII EN 16931", async () => {
    const { pdf, xml } = await generateFacturX(sampleInvoice);

    expect(pdf.length).toBeGreaterThan(5000);
    expect(xml).toContain("urn:cen.eu:en16931:2017");
    expect(xml).toContain("FACT-2026-0001");
    expect(xml).toContain("6000");

    // Artefacts pour la validation de conformité (Mustang / CI).
    mkdirSync(".artifacts", { recursive: true });
    writeFileSync(".artifacts/sample-invoice.pdf", pdf);
    writeFileSync(".artifacts/sample-invoice.xml", xml);
  }, 30000);
});
