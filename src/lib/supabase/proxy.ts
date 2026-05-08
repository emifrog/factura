import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";

/**
 * Routes du groupe (auth) : login, callback, etc. — accessibles sans session.
 * Les autres routes du groupe (app) exigent une session.
 *
 * On garde une liste explicite plutôt que de regarder la structure de dossier,
 * parce que le proxy ne voit que des URLs.
 */
const PUBLIC_PATHS = ["/", "/login", "/auth/callback", "/auth/error"];
const PROTECTED_PREFIXES = ["/account", "/dashboard", "/invoices", "/clients"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

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

  const supabase = createServerClient(
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
  // sur son espace.
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const PROXY_PUBLIC_PATHS = PUBLIC_PATHS;
export const PROXY_PROTECTED_PREFIXES = PROTECTED_PREFIXES;
export { isPublic, isProtected };
