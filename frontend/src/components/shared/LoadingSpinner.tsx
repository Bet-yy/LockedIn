interface LoadingSpinnerProps {
  label?: string;
  compact?: boolean;
}

export function LoadingSpinner({ label = 'Loading...', compact = false }: LoadingSpinnerProps) {
  return (
    <div className={compact ? 'inline-flex items-center gap-3' : 'flex items-center gap-3'}>
      <span
        className={[
          'inline-block animate-spin rounded-full border-2 border-cyan-200/25 border-t-cyan-300',
          compact ? 'h-4 w-4' : 'h-5 w-5',
        ].join(' ')}
      />
      <span className={compact ? 'text-sm text-sand-200/72' : 'text-sm text-sand-200/72'}>{label}</span>
    </div>
  );
}
