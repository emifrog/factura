import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <Card>
      <CardBody className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Recevez un lien de connexion sécurisé par email.
          </p>
        </div>

        <MagicLinkForm />

        <p className="text-center text-sm text-ink-muted">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-action">
            Créer un compte
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
