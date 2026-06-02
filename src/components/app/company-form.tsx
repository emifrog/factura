"use client";

import { useActionState, useState, useTransition } from "react";
import {
  IconSearch,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { saveCompany, verifySiren } from "@/lib/company/actions";
import type { CompanySaveState } from "@/lib/company/schemas";
import type {
  CompanyLegalForm,
  CompanyVatRegime,
} from "@/lib/supabase/database.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const LEGAL_FORMS = [
  { value: "EI", label: "Entreprise individuelle" },
  { value: "micro", label: "Micro-entreprise" },
  { value: "EURL", label: "EURL" },
  { value: "SASU", label: "SASU" },
];

const VAT_REGIMES = [
  { value: "franchise", label: "Franchise en base de TVA" },
  { value: "reel_simplifie", label: "Réel simplifié" },
  { value: "reel_normal", label: "Réel normal" },
];

export type CompanyDefaults = {
  legalName: string;
  siren: string;
  legalForm: CompanyLegalForm;
  vatRegime: CompanyVatRegime;
  vatNumber: string;
  vatOnDebits: boolean;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  iban: string;
};

const initialState: CompanySaveState = { status: "idle" };

export function CompanyForm({ defaults }: { defaults: CompanyDefaults }) {
  const [fields, setFields] = useState(defaults);
  const [state, formAction, isSaving] = useActionState(
    saveCompany,
    initialState,
  );
  const [isVerifying, startVerify] = useTransition();
  const [sirenFeedback, setSirenFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const set = (key: keyof CompanyDefaults, value: string | boolean) =>
    setFields((f) => ({ ...f, [key]: value }));

  const fieldError = (key: keyof CompanyDefaults) =>
    state.status === "error" ? state.fieldErrors?.[key] : undefined;

  function handleVerify() {
    setSirenFeedback(null);
    startVerify(async () => {
      const result = await verifySiren(fields.siren);
      if (result.status === "found") {
        setFields((f) => ({
          ...f,
          legalName: result.company.legalName || f.legalName,
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
      {/* SIREN + vérification */}
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

      <Input
        label="Raison sociale"
        name="legalName"
        value={fields.legalName}
        onChange={(e) => set("legalName", e.target.value)}
        error={fieldError("legalName")}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Select
          label="Forme juridique"
          name="legalForm"
          options={LEGAL_FORMS}
          value={fields.legalForm}
          onChange={(e) => set("legalForm", e.target.value)}
          error={fieldError("legalForm")}
        />
        <Select
          label="Régime de TVA"
          name="vatRegime"
          options={VAT_REGIMES}
          value={fields.vatRegime}
          onChange={(e) => set("vatRegime", e.target.value)}
          error={fieldError("vatRegime")}
        />
      </div>

      <Input
        label="N° de TVA intracommunautaire"
        name="vatNumber"
        value={fields.vatNumber}
        onChange={(e) => set("vatNumber", e.target.value)}
        error={fieldError("vatNumber")}
      />

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="vatOnDebits"
          checked={fields.vatOnDebits}
          onChange={(e) => set("vatOnDebits", e.target.checked)}
          className="size-4 rounded border-border-strong text-success focus-visible:ring-action/20"
        />
        Option TVA sur les débits
      </label>

      <fieldset className="flex flex-col gap-6">
        <legend className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
          Adresse
        </legend>
        <Input
          label="Adresse"
          name="addressLine1"
          value={fields.addressLine1}
          onChange={(e) => set("addressLine1", e.target.value)}
          error={fieldError("addressLine1")}
        />
        <Input
          label="Complément"
          name="addressLine2"
          value={fields.addressLine2}
          onChange={(e) => set("addressLine2", e.target.value)}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label="Code postal"
            name="postalCode"
            value={fields.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            error={fieldError("postalCode")}
          />
          <Input
            label="Ville"
            name="city"
            value={fields.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
      </fieldset>

      <Input
        label="IBAN"
        name="iban"
        value={fields.iban}
        onChange={(e) => set("iban", e.target.value)}
        error={fieldError("iban")}
      />

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {state.status === "success" && (
          <span className="text-sm text-success">Entreprise enregistrée.</span>
        )}
        {state.status === "error" && !state.fieldErrors && (
          <span className="text-sm text-danger-strong">{state.message}</span>
        )}
      </div>
    </form>
  );
}
