import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";

/**
 * Client Supabase à utiliser dans les Server Components, Server Actions
 * et Route Handlers. Lit les cookies de session via `next/headers`.
 *
 * Note Next 16 : `cookies()` est asynchrone, d'où le `await` sur l'appel.
 *
 * `setAll` peut échouer dans un Server Component (les cookies ne peuvent
 * être écrits qu'en Server Action ou Route Handler) : on absorbe l'erreur
 * silencieusement, le proxy de session se chargera du refresh côté requête.
 */
export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Lecture seule en RSC — laissé au proxy de session.
        }
      },
    },
  });
}
