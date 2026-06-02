"use client";

import { useActionState } from "react";
import { IconCircleCheck } from "@tabler/icons-react";
import { acceptQuote, refuseQuote } from "@/lib/quotes/public-actions";
import type { AcceptQuoteResult } from "@/lib/quotes/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: AcceptQuoteResult = { ok: false, error: "" };

export function QuoteAcceptForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptQuote, initial);

  if (state.ok && state.decision === "accepted") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
        <IconCircleCheck size={18} aria-hidden /> Devis accepté. Merci ! Le
        prestataire en est informé.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <Input
          label="Votre nom et prénom"
          name="signerName"
          required
          placeholder="Jean Dupont"
        />
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-4 rounded border-border-strong"
          />
          <span>
            J&apos;accepte ce devis et confirme mon bon pour accord (valant
            signature électronique simple).
          </span>
        </label>
        {!state.ok && state.error && (
          <p className="text-sm text-danger-strong">{state.error}</p>
        )}
        <Button type="submit" variant="success" disabled={pending}>
          {pending ? "Validation…" : "Accepter le devis"}
        </Button>
      </form>

      <form action={refuseQuote}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="ghost" size="sm">
          Refuser
        </Button>
      </form>
    </div>
  );
}
