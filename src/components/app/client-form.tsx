"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { saveClient } from "@/lib/clients/actions";
import { verifySiren } from "@/lib/company/actions";
import type { ClientSaveState } from "@/lib/clients/schemas";
import type { ClientKind } from "@/lib/supabase/database.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const KINDS = [
  { value: "b2b", label: "Professionnel (B2B)" },
  { value: "b2c", label: "Particulier (B2C)" },
  { value: "international", label: "International" },
];

export type ClientDefaults = {
  id?: string;
  kind: ClientKind;
  name: string;
  siren: string;
  vatNumber: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
};

const initialState: ClientSaveState = { status: "idle" };

export function ClientForm({ defaults }: { defaults: ClientDefaults }) {
  const [fields, setFields] = useState(defaults);
  const [state, formAction, isSaving] = useActionState(
    saveClient,
    initialState,
  );
  const [isVerifying, startVerify] = useTransition();
  const [sirenFeedback, setSirenFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const set = (key: keyof ClientDefaults, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  const fieldError = (key: string) =>
    state.status === "error" ? state.fieldErrors?.[key] : undefined;

  const showSiren = fields.kind === "b2b";
  const showVat = fields.kind === "b2b" || fields.kind === "international";

  function handleVerify() {
    setSirenFeedback(null);
    startVerify(async () => {
      const result = await verifySiren(fields.siren);
      if (result.status === "found") {
        setFields((f) => ({
          ...f,
          name: result.company.legalName || f.name,
          vatNumber: result.company.vatNumber || f.vatNumber,
          addressLine1: result.company.addressLine1 ?? f.addressLine1,
          postalCode: result.company.postalCode ?? f.postalCode,
          city: result.company.city ?? f.city,
        }));
        setSirenFeedback({
          tone: "success",
          message: `Entreprise trouvée : ${result.company.legalName}`,
        });
      } else if (result.status === "not_found") {
        setSirenFeedback({
          tone: "error",
          message: "Aucune entreprise trouvée pour ce SIREN.",
        });
      } else {
        setSirenFeedback({ tone: "error", message: result.message });
      }
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <Select
        label="Type de client"
        name="kind"
        options={KINDS}
        value={fields.kind}
        onChange={(e) => set("kind", e.target.value)}
        error={fieldError("kind")}
      />

      {showSiren && (
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="SIREN"
                name="siren"
                value={fields.siren}
                onChange={(e) => set("siren", e.target.value)}
                inputMode="numeric"
                placeholder="9 chiffres"
                error={fieldError("siren")}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleVerify}
              disabled={isVerifying || fields.siren.trim().length === 0}
            >
              <IconSearch size={16} aria-hidden />
              {isVerifying ? "Vérification…" : "Vérifier"}
            </Button>
          </div>
          {sirenFeedback && (
            <p
              className={`flex items-center gap-1.5 text-xs ${
                sirenFeedback.tone === "success"
                  ? "text-success"
                  : "text-danger-strong"
              }`}
            >
              {sirenFeedback.tone === "success" ? (
                <IconCircleCheck size={14} aria-hidden />
              ) : (
                <IconAlertTriangle size={14} aria-hidden />
              )}
              {sirenFeedback.message}
            </p>
          )}
        </div>
      )}

      {/* Champ SIREN caché pour B2B masqué : on conserve la valeur en B2B uniquement. */}
      {!showSiren && <input type="hidden" name="siren" value="" />}

      <Input
        label={fields.kind === "b2c" ? "Nom" : "Raison sociale"}
        name="name"
        value={fields.name}
        onChange={(e) => set("name", e.target.value)}
        error={fieldError("name")}
      />

      {showVat && (
        <Input
          label="N° de TVA intracommunautaire"
          name="vatNumber"
          value={fields.vatNumber}
          onChange={(e) => set("vatNumber", e.target.value)}
          error={fieldError("vatNumber")}
        />
      )}
      {!showVat && <input type="hidden" name="vatNumber" value="" />}

      <Input
        label="Email"
        name="email"
        type="email"
        value={fields.email}
        onChange={(e) => set("email", e.target.value)}
        error={fieldError("email")}
      />

      <fieldset className="flex flex-col gap-6">
        <legend className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
          Adresse
        </legend>
        <Input
          label="Adresse"
          name="addressLine1"
          value={fields.addressLine1}
          onChange={(e) => set("addressLine1", e.target.value)}
        />
        <Input
          label="Complément"
          name="addressLine2"
          value={fields.addressLine2}
          onChange={(e) => set("addressLine2", e.target.value)}
        />
        <div className="grid gap-6 sm:grid-cols-3">
          <Input
            label="Code postal"
            name="postalCode"
            value={fields.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
          />
          <Input
            label="Ville"
            name="city"
            value={fields.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <Input
            label="Pays"
            name="country"
            value={fields.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </div>
      </fieldset>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-danger-strong">{state.message}</p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/clients">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
