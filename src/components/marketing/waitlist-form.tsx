"use client";

import { useActionState } from "react";
import { IconCircleCheck } from "@tabler/icons-react";
import { joinWaitlist } from "@/lib/waitlist/actions";
import type { WaitlistState } from "@/lib/waitlist/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: WaitlistState = { status: "idle" };

export function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [state, formAction, isPending] = useActionState(
    joinWaitlist,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-4 text-sm text-ink">
        <IconCircleCheck size={20} className="text-success" aria-hidden />
        Vérifiez votre boîte mail pour confirmer votre inscription.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-start"
    >
      <input type="hidden" name="source" value={source} />
      <div className="flex-1">
        <Input
          name="email"
          type="email"
          required
          placeholder="vous@exemple.fr"
          aria-label="Adresse email"
          error={state.status === "error" ? state.message : undefined}
        />
      </div>
      <Button type="submit" disabled={isPending} className="sm:h-11">
        {isPending ? "Envoi…" : "Être prévenu·e"}
      </Button>
    </form>
  );
}
