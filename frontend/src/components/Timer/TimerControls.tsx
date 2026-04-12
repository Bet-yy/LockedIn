interface TimerControlsProps {
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({ isRunning, onStartPause, onReset, onSkip }: TimerControlsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onStartPause}
        className="rounded-full bg-coral-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral-400"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-sand-100 transition hover:bg-white/10"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
      >
        Skip
      </button>
    </div>
  );
}
