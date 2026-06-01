import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { ProfileForm } from "@/components/app/profile-form";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <header>
        <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
          Compte
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Mon profil
        </h1>
      </header>

      <Card>
        <CardBody>
          <ProfileForm
            email={profile?.email ?? user!.email!}
            fullName={profile?.full_name ?? null}
          />
        </CardBody>
      </Card>
    </div>
  );
}
