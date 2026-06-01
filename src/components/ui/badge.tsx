import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "action" | "danger";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-surface-subtle text-ink-muted",
  success: "bg-success/10 text-success",
  action: "bg-action/10 text-action",
  danger: "bg-danger/10 text-danger-strong",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Chip pleine pilule : texte haute densité sur fond teinté à 10 %. */
export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
