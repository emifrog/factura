import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next 16 : le fichier `proxy.ts` remplace `middleware.ts`, et la fonction
 * exportée se nomme `proxy`. Elle s'exécute pour chaque requête correspondante.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf : assets statiques Next, favicon et images.
     * On rafraîchit ainsi la session partout sans surcoût sur les assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
