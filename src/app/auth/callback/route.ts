import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cible de redirection du magic link. Supabase renvoie un `code` (flux PKCE)
 * que l'on échange contre une session, puis on redirige vers le dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Lien invalide ou expiré.
  return NextResponse.redirect(`${origin}/login?error=lien_invalide`);
}
