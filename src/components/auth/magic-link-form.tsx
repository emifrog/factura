"use client";

import { useActionState } from "react";
import { IconMail, IconCircleCheck } from "@tabler/icons-react";
import { requestMagicLink } from "@/lib/auth/actions";
import type { MagicLinkState } from "@/lib/auth/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: MagicLinkState = { status: "idle" };

export function MagicLinkForm({ withName = false }: { withName?: boolean }) {
  const [state, formAction, isPending] = useActionState(
    requestMagicLink,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-subtle p-6 text-center">
        <IconCircleCheck size={32} className="text-success" aria-hidden />
        <p className="text-sm text-ink">
          Lien envoyé à <span className="font-semibold">{state.email}</span>.
          <br />
          Ouvrez votre boîte mail pour vous connecter.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {withName && (
        <Input
          label="Nom complet"
          name="fullName"
          type="text"
          autoComplete="name"
          error={
            state.status === "error" ? state.fieldErrors?.fullName : undefined
          }
        />
      )}
      <Input
        label="Adresse email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="vous@exemple.fr"
        error={state.status === "error" ? state.fieldErrors?.email : undefined}
      />

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-danger-strong">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        <IconMail size={16} aria-hidden />
        {isPending ? "Envoi…" : "Recevoir le lien de connexion"}
      </Button>
    </form>
  );
}
