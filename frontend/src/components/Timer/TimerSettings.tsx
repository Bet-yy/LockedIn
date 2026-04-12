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
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="section-label">Timer Settings</p>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          Save
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Work (min)', value: workMinutes, setter: setWorkMinutes },
          { label: 'Short Break', value: shortBreakMinutes, setter: setShortBreakMinutes },
          { label: 'Long Break', value: longBreakMinutes, setter: setLongBreakMinutes },
        ].map(({ label, value, setter }) => (
          <label key={label} className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
            <input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setter(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
