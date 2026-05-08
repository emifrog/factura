import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Field — wrapper pour le pattern "label TOUJOURS au-dessus du champ"
 * imposé par DESIGN.md.
 *
 * Usage :
 *   <Field>
 *     <FieldLabel htmlFor="email">Adresse email</FieldLabel>
 *     <Input id="email" name="email" type="email" required />
 *     <FieldHint>On ne partagera pas votre email.</FieldHint>
 *   </Field>
 *
 *   <Field invalid>
 *     <FieldLabel htmlFor="email">Adresse email</FieldLabel>
 *     <Input id="email" aria-invalid />
 *     <FieldError>Adresse email invalide</FieldError>
 *   </Field>
 */
function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-on-surface text-sm font-medium", className)}
      {...props}
    />
  );
}

function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-hint"
      className={cn("text-on-surface-variant text-xs", className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      className={cn("text-error text-xs", className)}
      role="alert"
      {...props}
    />
  );
}

export { Field, FieldLabel, FieldHint, FieldError };
