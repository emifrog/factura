"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithMagicLink } from "@/lib/auth-actions";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function LoginForm({ next }: { next?: string }) {
  const emailId = useId();
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    setState({ kind: "submitting" });

    startTransition(async () => {
      const result = await signInWithMagicLink({ email, next });
      if (result.ok) {
        setState({ kind: "sent" });
        return;
      }
      switch (result.error) {
        case "invalid":
          setState({
            kind: "error",
            message: result.fieldErrors.email?.[0] ?? "Adresse email invalide",
          });
          return;
        case "server":
          setState({ kind: "error", message: result.message });
      }
    });
  }

  if (state.kind === "sent") {
    return (
      <div className="bg-muted/40 text-foreground rounded-lg border px-4 py-3 text-sm">
        <p className="font-medium">Vérifiez votre boîte mail.</p>
        <p className="text-muted-foreground mt-1">
          Un lien de connexion vient d&apos;être envoyé. Il est valable 1 heure et utilisable une
          seule fois.
        </p>
      </div>
    );
  }

  const submitting = isPending || state.kind === "submitting";

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium">
          Adresse email
        </label>
        <Input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.fr"
          aria-invalid={state.kind === "error" ? true : undefined}
          aria-describedby={state.kind === "error" ? `${emailId}-error` : undefined}
          disabled={submitting}
        />
        {state.kind === "error" ? (
          <p id={`${emailId}-error`} className="text-destructive mt-1 text-xs">
            {state.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Envoi en cours…" : "Recevoir un lien de connexion"}
      </Button>
    </form>
  );
}
