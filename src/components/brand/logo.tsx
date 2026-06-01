import Link from "next/link";
import { cn } from "@/lib/utils";

/** Logo Factura : carré bleu nuit "F" + nom de marque (repris des maquettes). */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Factura — accueil"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-brand font-display text-[15px] font-bold tracking-tight text-brand-foreground">
        F
      </span>
      <span className="font-display text-[15px] font-bold tracking-tight text-ink">
        Factura
      </span>
    </Link>
  );
}
