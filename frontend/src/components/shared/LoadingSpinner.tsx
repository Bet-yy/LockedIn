interface LoadingSpinnerProps {
  label?: string;
  compact?: boolean;
}

export function LoadingSpinner({ label = 'Loading...', compact = false }: LoadingSpinnerProps) {
  return (
    <div className={compact ? 'inline-flex items-center gap-3' : 'flex items-center gap-3'}>
      <span
        className={[
          'inline-block animate-spin rounded-full border-2 border-violet-200 border-t-violet-500',
          compact ? 'h-4 w-4' : 'h-5 w-5',
        ].join(' ')}
      />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
