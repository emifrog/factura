import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Confirmation double opt-in : le lien de l'email pointe ici avec le token.
 * On marque confirmed_at puis on redirige vers la landing avec un statut.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/?waitlist=erreur`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("waitlist")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("confirmation_token", token)
    .is("confirmed_at", null);

  if (error) {
    return NextResponse.redirect(`${origin}/?waitlist=erreur`);
  }

  // Token déjà confirmé (0 ligne mise à jour) ou nouvellement confirmé :
  // dans les deux cas, l'utilisateur est sur la liste.
  return NextResponse.redirect(`${origin}/?waitlist=confirme`);
}
