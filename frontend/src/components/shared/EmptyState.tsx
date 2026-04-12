interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.03] p-6 text-center">
      <h3 className="font-display text-xl font-semibold text-sand-100">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-sand-200/70">{description}</p>
    </div>
  );
}
