import { describe, it, expect } from "vitest";
import { invoicesToCsv, type InvoiceCsvRow } from "./csv";

const row: InvoiceCsvRow = {
  issueDate: "2026-06-02",
  number: "FACT-2026-0001",
  clientName: "Acme",
  clientSiren: "812345678",
  lineTotal: 6000,
  taxTotal: 1200,
  grandTotal: 7200,
  status: "Émise",
  paidAt: null,
};

describe("invoicesToCsv", () => {
  it("génère l'en-tête + une ligne (décimale virgule)", () => {
    const csv = invoicesToCsv([row]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("Total TTC");
    expect(lines[1]).toContain("FACT-2026-0001");
    expect(lines[1]).toContain("7200,00");
  });

  it("échappe les valeurs contenant le séparateur", () => {
    const csv = invoicesToCsv([{ ...row, clientName: "Dupont; Fils" }]);
    expect(csv).toContain('"Dupont; Fils"');
  });

  it("gère une liste vide (en-tête seul)", () => {
    expect(invoicesToCsv([]).split("\r\n")).toHaveLength(1);
  });
});
