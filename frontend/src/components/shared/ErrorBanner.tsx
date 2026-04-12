interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-coral-400/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-100">
      {message}
    </div>
  );
}
