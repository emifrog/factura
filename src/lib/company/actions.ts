"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lookupSiren } from "@/lib/sirene/lookup";
import type { SireneLookupResult } from "@/lib/sirene/schemas";
import {
  companySchema,
  type CompanyInput,
  type CompanySaveState,
} from "./schemas";

/** Vérifie un SIREN (appelée depuis le formulaire pour pré-remplir). */
export async function verifySiren(siren: string): Promise<SireneLookupResult> {
  return lookupSiren(siren);
}

/** Crée ou met à jour l'entreprise de l'utilisateur courant (upsert). */
export async function saveCompany(
  _prevState: CompanySaveState,
  formData: FormData,
): Promise<CompanySaveState> {
  const parsed = companySchema.safeParse({
    legalName: formData.get("legalName"),
    siren: formData.get("siren") ?? "",
    legalForm: formData.get("legalForm"),
    vatRegime: formData.get("vatRegime"),
    vatNumber: formData.get("vatNumber") ?? undefined,
    vatOnDebits: formData.get("vatOnDebits"),
    addressLine1: formData.get("addressLine1") ?? undefined,
    addressLine2: formData.get("addressLine2") ?? undefined,
    postalCode: formData.get("postalCode") ?? undefined,
    city: formData.get("city") ?? undefined,
    iban: formData.get("iban") ?? "",
    reminderEnabled: formData.get("reminderEnabled"),
    reminderSignature: formData.get("reminderSignature") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof CompanyInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof CompanyInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Vérifiez le formulaire.", fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Session expirée. Reconnectez-vous." };
  }

  const c = parsed.data;
  const { error } = await supabase.from("companies").upsert(
    {
      profile_id: user.id,
      legal_name: c.legalName,
      siren: c.siren,
      legal_form: c.legalForm,
      vat_regime: c.vatRegime,
      vat_number: c.vatNumber,
      vat_on_debits: c.vatOnDebits,
      address_line1: c.addressLine1,
      address_line2: c.addressLine2,
      postal_code: c.postalCode,
      city: c.city,
      iban: c.iban,
      reminder_enabled: c.reminderEnabled,
      reminder_signature: c.reminderSignature,
    },
    { onConflict: "profile_id" },
  );

  if (error) {
    return { status: "error", message: "Échec de l'enregistrement." };
  }

  revalidatePath("/company");
  return { status: "success" };
}
