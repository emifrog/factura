import type { SelectHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({
  className,
  label,
  error,
  options,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-11 rounded-md border bg-surface px-4 text-sm text-ink transition-shadow outline-none",
          "focus-visible:border-action focus-visible:ring-3 focus-visible:ring-action/20",
          error ? "border-danger" : "border-border-strong",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-strong">{error}</p>}
    </div>
  );
}
