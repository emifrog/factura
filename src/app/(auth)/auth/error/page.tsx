import Link from "next/link";
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion impossible</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Link href="/login" className={buttonVariants({ size: "lg" })}>
        Demander un nouveau lien
      </Link>
    </main>
  );
}
