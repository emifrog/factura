import { z } from "zod";

export const invoiceLineInputSchema = z.object({
  description: z.string().trim().min(1, "Description requise.").max(300),
  quantity: z.coerce.number().min(0, "Quantité invalide."),
  unitPrice: z.coerce.number(),
  vatRate: z.coerce.number().min(0).max(100),
  unitCode: z.string().default("C62"),
  vatCategory: z.string().default("S"),
});

export const invoiceDraftSchema = z.object({
  clientId: z
    .string()
    .uuid()
    .nullish()
    .transform((v) => v ?? null),
  category: z.enum(["goods", "services", "mixed"]),
  dueDate: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null)),
  currency: z.string().default("EUR"),
  vatOnDebits: z.boolean().default(false),
  lines: z.array(invoiceLineInputSchema),
});

export type InvoiceLineInputData = z.infer<typeof invoiceLineInputSchema>;
export type InvoiceDraftData = z.infer<typeof invoiceDraftSchema>;

export type SaveDraftResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type IssueResult = { ok: true } | { ok: false; error: string };
