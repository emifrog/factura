import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

/**
 * Input — design system Factura Core.
 *
 * Pattern : label TOUJOURS au-dessus du champ (cf. DESIGN.md "Labels are
 * always positioned above the field, never as placeholders"). Voir
 * <Field> pour la composition label + input + erreur.
 *
 * Focus state : 1px primary (action blue) + 3px soft glow (ring-ring/30).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "border-outline-variant bg-surface-container-lowest text-on-surface flex h-10 w-full min-w-0 rounded-md border px-3 py-2 text-sm transition-colors",
        "placeholder:text-on-surface-variant/70",
        "focus-visible:border-tertiary focus-visible:ring-tertiary/20 focus-visible:ring-3 focus-visible:outline-none",
        "aria-invalid:border-error aria-invalid:ring-error/20 aria-invalid:ring-3",
        "disabled:bg-surface-container-low disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
