import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiniCalendar } from '../components/Calendar/MiniCalendar';
import { TimerSettings } from '../components/Timer/TimerSettings';
import { useInterval } from '../hooks/useInterval';
import { useTimerStore } from '../store/timerStore';
import { useTaskStore } from '../store/taskStore';
import { listTasks } from '../api/tasks';

function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const modeLabelMap = {
  work: 'Work Session',
  short_break: 'Short Break',
  long_break: 'Long Break',
} as const;

export function HomePage() {
  const navigate = useNavigate();
  const { secondsLeft, mode, isRunning, setRunning, setMode, tick, reset, skipToNextMode } = useTimerStore();
  const { tasks, setTasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const previousSecondsRef = useRef(secondsLeft);
  const previousModeRef = useRef(mode);

  useInterval(() => { tick(); }, isRunning ? 1000 : null);

  // Notification on session complete
  useEffect(() => {
    const sessionFinished = previousSecondsRef.current === 1 && secondsLeft > previousSecondsRef.current - 1;
    const modeChanged = previousModeRef.current !== mode;
    if (sessionFinished && modeChanged && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('LockedIn timer complete', { body: `Next up: ${modeLabelMap[mode]}.` });
      } else if (Notification.permission === 'default') {
        void Notification.requestPermission();
      }
    }
    previousSecondsRef.current = secondsLeft;
    previousModeRef.current = mode;
  }, [mode, secondsLeft]);

  // Load tasks for calendar event dots
  useEffect(() => {
    void (async () => {
      try {
        const t = await listTasks();
        setTasks(t);
      } catch { /* ignore */ }
    })();
  }, [setTasks]);

  // Build calendar events from tasks that have due dates
  const calendarEvents = tasks
    .filter((t) => t.due_date)
    .map((t) => ({
      date: t.due_date!,
      color: t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-violet-400',
      label: t.title,
    }));

  // Tasks due on selected date (or today if none selected)
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const focusDate = selectedDate || todayKey;
  const tasksOnDate = tasks.filter((t) => t.due_date === focusDate && !t.completed);

  const modeColor =
    mode === 'work' ? 'text-violet-600' : mode === 'short_break' ? 'text-emerald-600' : 'text-amber-600';
  const modeBg =
    mode === 'work' ? 'bg-violet-50 border-violet-200' : mode === 'short_break' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="section-label">Home</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">Pomodoro Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">Track your sessions and upcoming deadlines.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left col: Calendar */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <MiniCalendar
              events={calendarEvents}
              selectedDate={selectedDate}
              onDayClick={(d) => setSelectedDate(prev => prev === d ? '' : d)}
            />
          </div>

          {/* Tasks on selected/today */}
          <div className="glass-panel p-5">
            <p className="section-label">
              {selectedDate && selectedDate !== todayKey ? selectedDate : 'Today'}
            </p>
            {tasksOnDate.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No tasks due{selectedDate && selectedDate !== todayKey ? ' on this day' : ' today'}.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {tasksOnDate.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-violet-400'}`} />
                    <span className="flex-1 font-medium text-gray-800">{t.title}</span>
                    {t.course_id && <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-600">Course</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/calendar')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add a Deadline
            </button>
            <button
              onClick={() => navigate('/to-do-list')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add a Task
            </button>
          </div>
        </div>

        {/* Right col: Timer */}
        <div className="space-y-4">
          {/* Timer card */}
          <div className={`glass-panel border-2 p-6 ${modeBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMode(mode === 'work' ? 'long_break' : mode === 'short_break' ? 'work' : 'short_break')}
                  className="rounded p-0.5 text-gray-400 transition hover:text-gray-600"
                  title="Previous mode"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <p className={`section-label ${modeColor}`}>{modeLabelMap[mode]}</p>
                <button
                  onClick={() => setMode(mode === 'work' ? 'short_break' : mode === 'short_break' ? 'long_break' : 'work')}
                  className="rounded p-0.5 text-gray-400 transition hover:text-gray-600"
                  title="Next mode"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setShowSettings((v) => !v)}
                title="Timer settings"
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-black/5 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className={`font-display text-7xl font-bold tabular-nums leading-none ${modeColor}`}>
                {formatTime(secondsLeft)}
              </p>
              <div className="mb-1 flex flex-col items-end gap-1">
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                  {isRunning ? 'Running' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => setRunning(!isRunning)}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                {isRunning ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                )}
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={skipToNextMode}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                Skip
              </button>
            </div>
          </div>

          {/* Session info */}
          <div className="glass-panel p-5">
            <p className="section-label">Session Info</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Sessions done', value: String(useTimerStore.getState().sessionsCompleted) },
                { label: 'Work mins', value: String(Math.round(useTimerStore.getState().workDuration / 60)) },
                { label: 'Next break', value: mode === 'long_break' ? 'Long' : mode === 'short_break' ? 'Short' : useTimerStore.getState().sessionsCompleted % 4 === 3 ? 'Long' : 'Short' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{item.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timer settings (collapsible) */}
          {showSettings && (
            <TimerSettings
              workDuration={useTimerStore.getState().workDuration}
              shortBreak={useTimerStore.getState().shortBreak}
              longBreak={useTimerStore.getState().longBreak}
              onSave={(durations) => {
                useTimerStore.getState().setDurations(durations);
                setShowSettings(false);
              }}
            />
          )}

          {/* Courses shortcut */}
          <button
            onClick={() => navigate('/courses')}
            className="glass-panel w-full p-5 text-left transition hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Courses</p>
                <p className="mt-1 font-display text-base font-semibold text-gray-800">Browse & manage your courses</p>
                <p className="mt-1 text-xs text-gray-400">Search UTD catalog, parse syllabus, generate study plans</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
