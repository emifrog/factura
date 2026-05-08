import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Préfixes des routes protégées : exigent une session valide.
 * Toutes les autres routes sont publiques (landing, login, callback, error,
 * pages marketing à venir).
 */
const PROTECTED_PREFIXES = ["/account", "/dashboard", "/invoices", "/clients"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Rafraîchit la session Supabase à chaque requête et redirige vers `/login`
 * les requêtes qui visent une route protégée sans session valide.
 *
 * Pattern officiel @supabase/ssr : on instancie un client avec un adaptateur
 * cookies branché sur la NextResponse, on appelle `getUser()` pour forcer le
 * refresh, puis on retourne la réponse (modifiée par `setAll` si refresh).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = getPublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANT : ne PAS retirer ce getUser() — il déclenche le refresh des cookies
  // de session expirés et c'est ce qui maintient l'utilisateur connecté.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isProtected(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est connecté et tente d'aller sur /login, on le renvoie
  // sur son espace (en respectant le ?next= s'il pointe vers une route
  // relative et non protégée par sécurité supplémentaire).
  if (user && pathname === "/login") {
    const rawNext = request.nextUrl.searchParams.get("next");
    const safeNext =
      rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";
    const url = request.nextUrl.clone();
    url.pathname = safeNext;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const PROXY_PROTECTED_PREFIXES = PROTECTED_PREFIXES;
export { isProtected };
