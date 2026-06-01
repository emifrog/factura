import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = { title: "Vue d'ensemble" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const prenom = profile?.full_name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
          Vue d&apos;ensemble
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Bonjour{prenom ? ` ${prenom}` : ""}
        </h1>
      </header>

      <Card>
        <CardBody>
          <p className="text-sm text-ink-muted">
            Votre espace est prêt. La création de factures, la réception et le
            suivi arriveront dans les prochaines étapes.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
