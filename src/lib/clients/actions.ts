"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { clientSchema, type ClientSaveState } from "./schemas";

/** Crée (si pas d'id) ou met à jour un client. Redirige vers /clients au succès. */
export async function saveClient(
  _prevState: ClientSaveState,
  formData: FormData,
): Promise<ClientSaveState> {
  const id = formData.get("id");

  const parsed = clientSchema.safeParse({
    kind: formData.get("kind"),
    name: formData.get("name"),
    siren: formData.get("siren") ?? "",
    vatNumber: formData.get("vatNumber") ?? undefined,
    email: formData.get("email") ?? "",
    addressLine1: formData.get("addressLine1") ?? undefined,
    addressLine2: formData.get("addressLine2") ?? undefined,
    postalCode: formData.get("postalCode") ?? undefined,
    city: formData.get("city") ?? undefined,
    country: formData.get("country") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
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
  const payload = {
    kind: c.kind,
    name: c.name,
    siren: c.siren,
    vat_number: c.vatNumber,
    email: c.email,
    address_line1: c.addressLine1,
    address_line2: c.addressLine2,
    postal_code: c.postalCode,
    city: c.city,
    country: c.country,
  };

  if (typeof id === "string" && id) {
    const { error } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", id)
      .eq("profile_id", user.id);
    if (error) {
      return { status: "error", message: "Échec de l'enregistrement." };
    }
  } else {
    const { error } = await supabase
      .from("clients")
      .insert({ profile_id: user.id, ...payload });
    if (error) {
      return { status: "error", message: "Échec de l'enregistrement." };
    }
  }

  revalidatePath("/clients");
  redirect("/clients");
}

/** Supprime un client de l'utilisateur courant. */
export async function deleteClient(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("profile_id", user.id);

  revalidatePath("/clients");
  redirect("/clients");
}
