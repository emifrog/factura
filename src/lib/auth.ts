import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Récupère l'utilisateur courant côté serveur (RSC, Server Action, Route Handler).
 * Retourne `null` si pas de session.
 *
 * Toujours utilisé dans le code métier comme source de vérité ; ne jamais se
 * baser uniquement sur la présence de cookies.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Variante stricte : redirige vers `/login` si pas de session.
 * À utiliser dans les pages du groupe (app) — le proxy fait déjà la redirection
 * mais on garde une 2e barrière (defense-in-depth) au cas où le matcher rate
 * une route ou qu'on appelle ce helper depuis un endroit non couvert.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
