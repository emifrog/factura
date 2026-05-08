import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy Next.js 16 (anciennement `middleware`).
 * Rafraîchit la session Supabase à chaque requête et protège les routes du
 * groupe (app). Voir `src/lib/supabase/proxy.ts` pour la logique.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /*
   * Match toutes les routes sauf :
   * - les API routes (gérées séparément)
   * - les fichiers statiques Next (`_next/static`, `_next/image`)
   * - les fichiers de métadonnées (favicon, sitemap, robots, og)
   * - tout fichier avec extension (images, fonts, etc.)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
