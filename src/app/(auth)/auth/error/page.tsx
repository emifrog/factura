import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type SearchParams = Promise<{ reason?: string | string[] }>;

const REASONS: Record<string, string> = {
  missing_code: "Lien invalide ou incomplet.",
  exchange_failed: "Lien expiré ou déjà utilisé.",
};

export default async function AuthErrorPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawReason = params.reason;
  const reason = typeof rawReason === "string" ? rawReason : undefined;
  const message = (reason && REASONS[reason]) ?? "Connexion impossible.";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-16">
      <div className="bg-error-soft flex items-start gap-3 rounded-md px-4 py-3">
        <AlertCircle className="text-error mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-on-surface text-base font-semibold tracking-tight">
            Connexion impossible
          </h1>
          <p className="text-on-surface-variant text-sm">{message}</p>
        </div>
      </div>
      <Link href="/login" className={buttonVariants({ size: "lg" })}>
        Demander un nouveau lien
      </Link>
    </main>
  );
}
