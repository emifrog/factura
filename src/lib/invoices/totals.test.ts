import { describe, it, expect } from "vitest";
import { computeInvoiceTotals, lineNet, round2 } from "./totals";

describe("totals", () => {
  it("arrondit à 2 décimales", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(
      lineNet({ quantity: 3, unitPrice: 9.99, vatRate: 20, vatCategory: "S" }),
    ).toBe(29.97);
  });

  it("calcule HT/TVA/TTC d'une ligne", () => {
    const t = computeInvoiceTotals([
      { quantity: 12, unitPrice: 500, vatRate: 20, vatCategory: "S" },
    ]);
    expect(t.lineTotal).toBe(6000);
    expect(t.taxTotal).toBe(1200);
    expect(t.grandTotal).toBe(7200);
  });

  it("regroupe la TVA par taux", () => {
    const t = computeInvoiceTotals([
      { quantity: 1, unitPrice: 100, vatRate: 20, vatCategory: "S" },
      { quantity: 1, unitPrice: 100, vatRate: 10, vatCategory: "S" },
      { quantity: 2, unitPrice: 50, vatRate: 20, vatCategory: "S" },
    ]);
    expect(t.lineTotal).toBe(300);
    expect(t.vatBreakdown).toHaveLength(2);
    const r20 = t.vatBreakdown.find((b) => b.ratePercent === 20)!;
    expect(r20.taxableAmount).toBe(200);
    expect(r20.taxAmount).toBe(40);
    expect(t.taxTotal).toBe(50); // 40 + 10
    expect(t.grandTotal).toBe(350);
  });

  it("gère la franchise en base (taux 0)", () => {
    const t = computeInvoiceTotals([
      { quantity: 1, unitPrice: 1000, vatRate: 0, vatCategory: "E" },
    ]);
    expect(t.taxTotal).toBe(0);
    expect(t.grandTotal).toBe(1000);
  });
});
