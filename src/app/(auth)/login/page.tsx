import { LoginForm } from "@/components/login-form";

type SearchParams = Promise<{ next?: string | string[] }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawNext = params.next;
  // Ne garder `next` que s'il s'agit d'un chemin relatif au site (sécurité :
  // empêche un open redirect via /login?next=https://evil.com).
  const next =
    typeof rawNext === "string" && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : undefined;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Connexion</h1>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Saisissez votre email pour recevoir un lien de connexion sécurisé. Pas de mot de passe à
          retenir.
        </p>
      </div>
      <LoginForm {...(next ? { next } : {})} />
    </main>
  );
}
