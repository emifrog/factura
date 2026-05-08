import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — design system Factura Core.
 *
 * Variantes :
 * - default : Deep Blue (primary), action principale.
 * - success : Emerald, "positive actions" exclusivement (envoyer facture,
 *   accepter paiement, confirmer ajout client).
 * - outline : bordure outline, action secondaire neutre.
 * - ghost : sans bordure, navigation ou action discrète.
 * - link : style lien, pour les CTA inline.
 * - destructive : tons error, suppressions.
 *
 * Hover : -10% lightness sur le fond pour les variantes pleines (cf.
 * DESIGN.md "Hover state: Lighten by 10%" — interprété comme assombrir
 * de 10% sur fond clair, qui correspond visuellement à la couleur active).
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/90",
        success: "bg-success text-on-success hover:bg-success/90",
        outline:
          "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
        ghost: "text-on-surface hover:bg-surface-container-low",
        link: "text-tertiary underline-offset-4 hover:underline",
        destructive: "bg-error text-on-error hover:bg-error/90",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-8 px-3 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
