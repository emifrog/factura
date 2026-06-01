import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <Card>
      <CardBody className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Sans mot de passe : on vous envoie un lien de connexion.
          </p>
        </div>

        <MagicLinkForm withName />

        <p className="text-center text-sm text-ink-muted">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-semibold text-action">
            Se connecter
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
