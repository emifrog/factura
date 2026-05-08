import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/profile";

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-8 py-10">
      <div className="flex flex-col gap-1.5">
        <span className="text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
          Mon espace
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Mon compte</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription>
            Affichée sur vos factures et devis. Vous pouvez la modifier à tout moment.
          </CardDescription>
        </CardHeader>
        <ProfileForm initialFirstName={profile.first_name} initialLastName={profile.last_name} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Adresse email associée à votre compte Factura.</CardDescription>
        </CardHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
          <dt className="text-on-surface-variant font-medium">Email</dt>
          <dd className="font-medium">{user.email}</dd>
          <dt className="text-on-surface-variant font-medium">Identifiant</dt>
          <dd className="text-on-surface-variant font-mono text-xs">{user.id}</dd>
        </dl>
      </Card>
    </main>
  );
}
