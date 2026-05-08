"use client";

import { useId, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { updateProfile } from "@/lib/profile-actions";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; fieldErrors?: Record<string, string[]>; message?: string };

type Props = {
  initialFirstName: string | null;
  initialLastName: string | null;
};

export function ProfileForm({ initialFirstName, initialLastName }: Props) {
  const firstNameId = useId();
  const lastNameId = useId();
  const firstNameErrId = `${firstNameId}-error`;
  const lastNameErrId = `${lastNameId}-error`;

  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const first_name = String(formData.get("first_name") ?? "");
    const last_name = String(formData.get("last_name") ?? "");
    setState({ kind: "submitting" });

    startTransition(async () => {
      const result = await updateProfile({ first_name, last_name });
      if (result.ok) {
        setState({ kind: "success" });
        return;
      }
      switch (result.error) {
        case "invalid":
          setState({ kind: "error", fieldErrors: result.fieldErrors });
          return;
        case "server":
          setState({
            kind: "error",
            message: "Impossible d'enregistrer pour l'instant. Réessayez dans un instant.",
          });
      }
    });
  }

  const submitting = isPending || state.kind === "submitting";
  const fieldErrors = state.kind === "error" ? state.fieldErrors : undefined;
  const firstError = fieldErrors?.first_name?.[0];
  const lastError = fieldErrors?.last_name?.[0];
  const serverError = state.kind === "error" && !fieldErrors ? state.message : undefined;

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={firstNameId}>Prénom</FieldLabel>
          <Input
            id={firstNameId}
            name="first_name"
            type="text"
            autoComplete="given-name"
            defaultValue={initialFirstName ?? ""}
            aria-invalid={firstError ? true : undefined}
            aria-describedby={firstError ? firstNameErrId : undefined}
            disabled={submitting}
          />
          {firstError ? <FieldError id={firstNameErrId}>{firstError}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor={lastNameId}>Nom</FieldLabel>
          <Input
            id={lastNameId}
            name="last_name"
            type="text"
            autoComplete="family-name"
            defaultValue={initialLastName ?? ""}
            aria-invalid={lastError ? true : undefined}
            aria-describedby={lastError ? lastNameErrId : undefined}
            disabled={submitting}
          />
          {lastError ? <FieldError id={lastNameErrId}>{lastError}</FieldError> : null}
        </Field>
      </div>

      {serverError ? (
        <p className="text-error text-sm" role="alert">
          {serverError}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {state.kind === "success" ? (
          <span className="text-on-surface-variant inline-flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="text-success size-4" aria-hidden="true" />
            Modifications enregistrées
          </span>
        ) : null}
      </div>
    </form>
  );
}
