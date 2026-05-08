import { Hammer } from "lucide-react";

type Props = {
  title: string;
  phase: string;
  description: string;
};

export function ConstructionPlaceholder({ title, phase, description }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-col gap-1.5">
        <span className="text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
          En cours de construction · {phase}
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      <div className="bg-surface-container-low text-on-surface-variant flex items-start gap-3 rounded-md px-4 py-3 text-sm">
        <Hammer className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>{description}</p>
      </div>
    </main>
  );
}
