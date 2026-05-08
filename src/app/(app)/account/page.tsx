import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Mon compte</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd>{user.email}</dd>
        <dt className="text-muted-foreground">ID</dt>
        <dd className="font-mono text-xs">{user.id}</dd>
      </dl>
      <p className="text-muted-foreground text-sm">
        Profil minimal — formulaire de modification ajouté en Phase 2 (table{" "}
        <code className="font-mono">profiles</code>).
      </p>
    </main>
  );
}
