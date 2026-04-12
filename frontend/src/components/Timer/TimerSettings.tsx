import { useEffect, useState } from 'react';

interface TimerSettingsProps {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  onSave: (durations: { workDuration: number; shortBreak: number; longBreak: number }) => void;
}

export function TimerSettings({ workDuration, shortBreak, longBreak, onSave }: TimerSettingsProps) {
  const [workMinutes, setWorkMinutes] = useState(Math.round(workDuration / 60));
  const [shortBreakMinutes, setShortBreakMinutes] = useState(Math.round(shortBreak / 60));
  const [longBreakMinutes, setLongBreakMinutes] = useState(Math.round(longBreak / 60));

  useEffect(() => {
    setWorkMinutes(Math.round(workDuration / 60));
  }, [workDuration]);

  useEffect(() => {
    setShortBreakMinutes(Math.round(shortBreak / 60));
  }, [shortBreak]);

  useEffect(() => {
    setLongBreakMinutes(Math.round(longBreak / 60));
  }, [longBreak]);

  function handleSave() {
    onSave({
      workDuration: Math.max(1, workMinutes) * 60,
      shortBreak: Math.max(1, shortBreakMinutes) * 60,
      longBreak: Math.max(1, longBreakMinutes) * 60,
    });
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-label">Timer Settings</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-sand-100">Tune your rhythm</h2>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-sand-100 transition hover:bg-white/10"
        >
          Save durations
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Work</span>
          <input
            type="number"
            min={1}
            value={workMinutes}
            onChange={(event) => setWorkMinutes(Math.max(1, Number(event.target.value) || 1))}
            className="w-full rounded-full border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-sand-100 outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Short Break</span>
          <input
            type="number"
            min={1}
            value={shortBreakMinutes}
            onChange={(event) => setShortBreakMinutes(Math.max(1, Number(event.target.value) || 1))}
            className="w-full rounded-full border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-sand-100 outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Long Break</span>
          <input
            type="number"
            min={1}
            value={longBreakMinutes}
            onChange={(event) => setLongBreakMinutes(Math.max(1, Number(event.target.value) || 1))}
            className="w-full rounded-full border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-sand-100 outline-none"
          />
        </label>
      </div>
      <p className="mt-4 text-sm leading-6 text-sand-200/68">
        Settings are persisted locally so the timer keeps your preferred rhythm between visits.
      </p>
    </div>
  );
}
