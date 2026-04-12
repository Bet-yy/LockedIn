import { useEffect, useMemo, useState } from 'react';
import { MiniCalendar } from '../components/Calendar/MiniCalendar';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { listTasks, createTask, deleteTask } from '../api/tasks';
import { getSavedCourses } from '../api/courses';
import { useTaskStore } from '../store/taskStore';
import { useCourseStore } from '../store/courseStore';
import type { Task } from '../types/task';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarPage() {
  const { tasks, setTasks, upsertTask, removeTask } = useTaskStore();
  const { savedCourses, setSavedCourses } = useCourseStore();
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [t, c] = await Promise.all([listTasks(), getSavedCourses()]);
        setTasks(t);
        setSavedCourses(c);
      } catch {
        setError('Could not load tasks. Make sure the backend is running.');
      }
    })();
  }, [setTasks, setSavedCourses]);

  const calendarEvents = tasks
    .filter((t) => t.due_date)
    .map((t) => ({
      date: t.due_date!,
      color: t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-violet-400',
      label: t.title,
    }));

  const deadlinesOnDate = useMemo(
    () => tasks.filter((t) => t.due_date === selectedDate),
    [tasks, selectedDate],
  );

  const upcomingDeadlines = useMemo(() => {
    const today = todayKey();
    return tasks
      .filter((t) => t.due_date && t.due_date >= today && !t.completed)
      .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
      .slice(0, 8);
  }, [tasks]);

  async function handleAddDeadline(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      const task = await createTask({
        title: newTitle.trim(),
        due_date: selectedDate,
        priority: newPriority,
        description: null,
        course_id: null,
      });
      upsertTask(task);
      setNewTitle('');
    } catch {
      setError('Failed to add deadline. Please try again.');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id);
      removeTask(task.id);
    } catch {
      setError('Failed to delete deadline.');
    }
  }

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-violet-100 text-violet-700 border-violet-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="section-label">Calendar</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">Deadline Planner</h1>
        <p className="mt-1 text-sm text-gray-500">Click a day to see or add deadlines.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: Calendar + add form */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <MiniCalendar
              events={calendarEvents}
              selectedDate={selectedDate}
              onDayClick={setSelectedDate}
            />
          </div>

          {/* Add deadline form */}
          <div className="glass-panel p-5">
            <p className="section-label">Add Deadline</p>
            <p className="mt-1 text-xs text-gray-400">
              Adding to{' '}
              <span className="font-semibold text-violet-600">{selectedDate}</span>
            </p>
            <form onSubmit={(e) => { void handleAddDeadline(e); }} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Deadline title…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <div className="flex items-center gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
                    className={[
                      'flex-1 rounded-lg border py-1.5 text-xs font-semibold capitalize transition',
                      newPriority === p ? priorityColors[p] : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={isAdding || !newTitle.trim()}
                className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
              >
                {isAdding ? 'Adding…' : 'Add Deadline'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Deadline preview */}
        <div className="space-y-4">
          {/* Deadlines on selected date */}
          <div className="glass-panel p-5">
            <p className="section-label">Deadline Preview</p>
            <p className="mt-0.5 text-xs text-gray-400">{selectedDate}</p>
            {deadlinesOnDate.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No deadlines on this day.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {deadlinesOnDate.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-violet-400'}`} />
                    <span className="flex-1 text-sm font-medium text-gray-800">{t.title}</span>
                    {t.priority && (
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${priorityColors[t.priority]}`}>
                        {t.priority}
                      </span>
                    )}
                    <button
                      onClick={() => { void handleDelete(t); }}
                      className="ml-1 rounded-lg p-1 text-gray-300 transition hover:bg-red-50 hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="glass-panel p-5">
            <p className="section-label">Upcoming</p>
            {upcomingDeadlines.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No upcoming deadlines.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {upcomingDeadlines.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-2.5">
                    <div className="shrink-0 text-center">
                      <p className="text-[10px] font-semibold uppercase text-gray-400">
                        {new Date(t.due_date! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="font-display text-lg font-bold leading-none text-gray-800">
                        {new Date(t.due_date! + 'T00:00:00').getDate()}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{t.title}</p>
                      {t.due_date === todayKey() && (
                        <p className="text-xs text-violet-500 font-semibold">Today</p>
                      )}
                    </div>
                    {t.priority && (
                      <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${priorityColors[t.priority]}`}>
                        {t.priority}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
