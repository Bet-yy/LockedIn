interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
      <h3 className="font-display text-base font-semibold text-gray-600">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
    </div>
  );
}
