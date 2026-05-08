type Props = {
  title: string;
  phase: string;
  description: string;
};

export function ConstructionPlaceholder({ title, phase, description }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10">
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          En cours de construction · {phase}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </main>
  );
}
