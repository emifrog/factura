import { z } from "zod";
import { invoiceLineInputSchema } from "@/lib/invoices/schemas";

export const quoteDraftSchema = z.object({
  clientId: z
    .string()
    .uuid()
    .nullish()
    .transform((v) => v ?? null),
  category: z.enum(["goods", "services", "mixed"]),
  validUntil: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null)),
  currency: z.string().default("EUR"),
  lines: z.array(invoiceLineInputSchema),
});

export type QuoteDraftData = z.infer<typeof quoteDraftSchema>;

export type SaveQuoteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type FinalizeQuoteResult = { ok: true } | { ok: false; error: string };

export type AcceptQuoteResult =
  | { ok: true; decision: "accepted" | "refused" }
  | { ok: false; error: string };
