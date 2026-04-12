import { useEffect, useMemo, useRef } from 'react';
import { PomodoroTimer } from '../components/Timer/PomodoroTimer';
import { TimerControls } from '../components/Timer/TimerControls';
import { TimerSettings } from '../components/Timer/TimerSettings';
import { PageIntro } from '../components/shared/PageIntro';
import { useInterval } from '../hooks/useInterval';
import { useTimerStore } from '../store/timerStore';

const modeLabelMap = {
  work: 'Work Session',
  short_break: 'Short Break',
  long_break: 'Long Break',
} as const;

function formatDocumentTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function TimerPage() {
  const {
    mode,
    secondsLeft,
    isRunning,
    sessionsCompleted,
    workDuration,
    shortBreak,
    longBreak,
    setRunning,
    setDurations,
    tick,
    reset,
    skipToNextMode,
  } = useTimerStore();
  const previousSecondsRef = useRef(secondsLeft);
  const previousModeRef = useRef(mode);

  useInterval(
    () => {
      tick();
    },
    isRunning ? 1000 : null,
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${modeLabelMap[mode]} - ${formatDocumentTime(secondsLeft)} | LockedIn`;
    }
  }, [mode, secondsLeft]);

  useEffect(() => {
    const sessionFinished = previousSecondsRef.current === 1 && secondsLeft > previousSecondsRef.current - 1;
    const modeChanged = previousModeRef.current !== mode;

    if (sessionFinished && modeChanged && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('LockedIn timer complete', {
          body: `Next up: ${modeLabelMap[mode]}.`,
        });
      } else if (Notification.permission === 'default') {
        void Notification.requestPermission();
      }
    }

    previousSecondsRef.current = secondsLeft;
    previousModeRef.current = mode;
  }, [mode, secondsLeft]);

  const sessionSummary = useMemo(
    () => [
      { label: 'Completed sessions', value: String(sessionsCompleted) },
      { label: 'Work minutes', value: String(Math.round(workDuration / 60)) },
      {
        label: 'Next break',
        value: mode === 'long_break' ? 'Long' : mode === 'short_break' ? 'Short' : sessionsCompleted % 4 === 3 ? 'Long' : 'Short',
      },
    ],
    [mode, sessionsCompleted, workDuration],
  );

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Pomodoro Timer"
        title="Keep momentum with a focused work-break rhythm."
        description="Run a client-side Pomodoro timer with pause, reset, skip, persistent settings, and automatic rollover from work into short or long breaks."
      />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <PomodoroTimer modeLabel={modeLabelMap[mode]} secondsLeft={secondsLeft} />
          <div className="glass-panel p-6">
            <p className="section-label">Controls</p>
            <div className="mt-5">
              <TimerControls
                isRunning={isRunning}
                onStartPause={() => setRunning(!isRunning)}
                onReset={reset}
                onSkip={skipToNextMode}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <p className="section-label">Session Summary</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {sessionSummary.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">{item.label}</p>
                  <p className="mt-3 font-display text-3xl font-semibold text-sand-100">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <TimerSettings
            workDuration={workDuration}
            shortBreak={shortBreak}
            longBreak={longBreak}
            onSave={setDurations}
          />
        </div>
      </section>
    </div>
  );
}
