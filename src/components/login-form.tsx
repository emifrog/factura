"use client";

import { useId, useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { signInWithMagicLink } from "@/lib/auth-actions";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function LoginForm({ next }: { next?: string }) {
  const emailId = useId();
  const errorId = `${emailId}-error`;
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
      <div className="bg-tertiary-container text-on-tertiary-container flex items-start gap-3 rounded-md px-4 py-3 text-sm">
        <Mail className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">Vérifiez votre boîte mail.</p>
          <p className="mt-0.5 opacity-80">
            Un lien de connexion vient d&apos;être envoyé. Il est valable 1 heure et utilisable une
            seule fois.
          </p>
        </div>
      </div>
    );
  }

  const submitting = isPending || state.kind === "submitting";
  const invalid = state.kind === "error";

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor={emailId}>Adresse email</FieldLabel>
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
        {invalid ? <FieldError id={errorId}>{state.message}</FieldError> : null}
      </Field>
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Envoi en cours…" : "Recevoir un lien de connexion"}
      </Button>
    </form>
  );
}
