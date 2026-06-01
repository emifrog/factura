import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "success" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variantStyles: Record<Variant, string> = {
  // Bleu nuit de marque — action principale neutre
  primary:
    "bg-brand text-brand-foreground hover:bg-brand/90 focus-visible:ring-brand/40",
  // Émeraude — actions positives (émettre, accepter un paiement)
  success:
    "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/40",
  // Bouton secondaire à bordure
  secondary:
    "bg-surface text-brand border border-border-strong hover:bg-surface-subtle focus-visible:ring-brand/30",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-subtle focus-visible:ring-brand/20",
  danger:
    "bg-transparent text-danger-strong hover:bg-danger/5 focus-visible:ring-danger/30",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-md",
  md: "h-11 px-4 text-sm gap-2 rounded-md",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Rend le composant enfant (ex. <Link>) en conservant le style du bouton. */
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      // Slot transmet le type à l'enfant ; on ne force "button" que pour un vrai <button>.
      type={asChild ? undefined : (type ?? "button")}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-semibold transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
