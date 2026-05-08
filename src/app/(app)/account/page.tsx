import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-col gap-1.5">
        <span className="text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
          Mon espace
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Mon compte</h1>
      </div>

      <Card>
        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
          <dt className="text-on-surface-variant font-medium">Email</dt>
          <dd className="font-medium">{user.email}</dd>
          <dt className="text-on-surface-variant font-medium">Identifiant</dt>
          <dd className="text-on-surface-variant font-mono text-xs">{user.id}</dd>
        </dl>
      </Card>

      <p className="text-on-surface-variant text-sm">
        Profil minimal — formulaire de modification ajouté en Phase 2 (table{" "}
        <code className="bg-surface-container-low rounded px-1 py-0.5 font-mono text-xs">
          profiles
        </code>
        ).
      </p>
    </main>
  );
}
