"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/profile/actions";
import type { UpdateProfileState } from "@/lib/profile/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: UpdateProfileState = { status: "idle" };

export function ProfileForm({
  email,
  fullName,
}: {
  email: string;
  fullName: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Input
        label="Adresse email"
        type="email"
        value={email}
        readOnly
        disabled
        hint="L'email de connexion ne peut pas être modifié ici."
      />
      <Input
        label="Nom complet"
        name="fullName"
        type="text"
        autoComplete="name"
        defaultValue={fullName ?? ""}
        error={state.status === "error" ? state.message : undefined}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {state.status === "success" && (
          <span className="text-sm text-success">Profil mis à jour.</span>
        )}
      </div>
    </form>
  );
}
