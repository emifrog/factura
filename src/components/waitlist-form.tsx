"use client";

import { useId, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { addToWaitlist } from "@/lib/waitlist";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "already" }
  | { kind: "error"; message: string };

export function WaitlistForm({ source }: { source?: string }) {
  const emailId = useId();
  const errorId = `${emailId}-error`;
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    setState({ kind: "submitting" });

    startTransition(async () => {
      const result = await addToWaitlist({ email, source });
      if (result.ok) {
        setState({ kind: "success" });
        return;
      }
      switch (result.error) {
        case "invalid":
          setState({
            kind: "error",
            message: result.fieldErrors.email?.[0] ?? "Adresse email invalide",
          });
          return;
        case "already_registered":
          setState({ kind: "already" });
          return;
        case "server":
          setState({
            kind: "error",
            message: "Impossible d'enregistrer pour l'instant. Réessayez dans un instant.",
          });
      }
    });
  }

  if (state.kind === "success" || state.kind === "already") {
    return (
      <div className="bg-success-soft text-on-surface flex items-start gap-3 rounded-md px-4 py-3 text-sm">
        <CheckCircle2 className="text-success mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">
            {state.kind === "success" ? "Merci, vous êtes inscrit." : "Vous êtes déjà inscrit."}
          </p>
          <p className="text-on-surface-variant mt-0.5">
            On vous prévient dès que Factura ouvre les inscriptions.
          </p>
        </div>
      </div>
    );
  }

  const submitting = isPending || state.kind === "submitting";
  const invalid = state.kind === "error";

  return (
    <form action={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor={emailId} className="sr-only">
          Adresse email
        </label>
        <Input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.fr"
          aria-invalid={invalid ? true : undefined}
          aria-describedby={invalid ? errorId : undefined}
          disabled={submitting}
        />
        {invalid ? (
          <FieldError id={errorId} className="mt-1.5">
            {state.message}
          </FieldError>
        ) : null}
      </div>
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Inscription…" : "Me prévenir"}
      </Button>
    </form>
  );
}
