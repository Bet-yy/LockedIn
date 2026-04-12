interface PomodoroTimerProps {
  modeLabel: string;
  secondsLeft: number;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function PomodoroTimer({ modeLabel, secondsLeft }: PomodoroTimerProps) {
  return (
    <div className="glass-panel overflow-hidden p-8 text-center">
      <p className="section-label">{modeLabel}</p>
      <div className="mt-6 rounded-[2rem] border border-cyan-300/15 bg-ink-950/75 px-6 py-10 shadow-glow">
        <p className="font-display text-6xl font-bold tracking-tight text-sand-100 md:text-7xl">{formatTime(secondsLeft)}</p>
        <p className="mt-4 text-sm uppercase tracking-[0.28em] text-sand-200/55">Locked In</p>
      </div>
    </div>
  );
}
