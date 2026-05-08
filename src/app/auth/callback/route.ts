import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route de callback pour les magic links Supabase.
 *
 * Quand l'utilisateur clique sur le lien reçu par email, Supabase l'amène
 * ici avec un `code` dans la query string. On échange ce code contre une
 * session (cookies posés par exchangeCodeForSession), puis on redirige
 * vers `next` (chemin relatif validé) ou /account par défaut.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?reason=missing_code", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("auth callback exchange failed", error);
    return NextResponse.redirect(new URL("/auth/error?reason=exchange_failed", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
