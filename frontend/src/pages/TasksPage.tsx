import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, deleteTask, listTasks, updateTask } from '../api/tasks';
import { getSavedCourses } from '../api/courses';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TaskList } from '../components/Tasks/TaskList';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Modal } from '../components/shared/Modal';
import { useCourseStore } from '../store/courseStore';
import { useTaskStore } from '../store/taskStore';
import type { Task, TaskPayload } from '../types/task';

type TabType = 'today' | 'upcoming';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TasksPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('today');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { tasks, isLoading, error, setTasks, upsertTask, removeTask, setIsLoading, setError } = useTaskStore();
  const { savedCourses, setSavedCourses } = useCourseStore();

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tasksRes, coursesRes] = await Promise.all([listTasks(), getSavedCourses()]);
        if (!isMounted) return;
        setTasks(tasksRes);
        setSavedCourses(coursesRes);
      } catch {
        if (isMounted) setError('Tasks could not be loaded. Check that the backend is running.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [setError, setIsLoading, setSavedCourses, setTasks]);

  const today = todayKey();

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.due_date === today),
    [tasks, today],
  );

  const upcomingTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.due_date && t.due_date > today && !t.completed)
        .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1)),
    [tasks, today],
  );

  const displayedTasks = tab === 'today' ? todayTasks : upcomingTasks;

  async function handleCreateTask(payload: TaskPayload) {
    try {
      const task = await createTask(payload);
      upsertTask(task);
      setError(null);
      setShowForm(false);
      return true;
    } catch {
      setError('Creating a task failed. Please try again.');
      return false;
    }
  }

  async function handleUpdateTask(taskId: string, payload: Partial<TaskPayload> & { completed?: boolean }) {
    try {
      const task = await updateTask(taskId, payload);
      upsertTask(task);
      setError(null);
      return true;
    } catch {
      setError('Updating the task failed. Please try again.');
      return false;
    }
  }

  async function handleDeleteTask(task: Task) {
    try {
      await deleteTask(task.id);
      removeTask(task.id);
      if (editingTask?.id === task.id) setEditingTask(null);
      setError(null);
    } catch {
      setError('Deleting the task failed. Please try again.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label">Tasks</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">To-Do List View</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your tasks and deadlines.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="glass-panel overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {(['today', 'upcoming'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'flex-1 py-3 text-sm font-semibold uppercase tracking-wide transition',
                tab === t
                  ? 'border-b-2 border-violet-600 text-violet-700'
                  : 'text-gray-400 hover:text-gray-600',
              ].join(' ')}
            >
              {t === 'today' ? 'Today' : 'Upcoming'}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="min-h-[280px] p-5">
          {isLoading ? (
            <LoadingSpinner label="Loading tasks…" />
          ) : displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium text-gray-400">
                {tab === 'today' ? 'Nothing due today.' : 'No upcoming tasks.'}
              </p>
            </div>
          ) : (
            <TaskList
              tasks={displayedTasks}
              courses={savedCourses}
              onToggleComplete={(task) => handleUpdateTask(task.id, { completed: !task.completed }).then(() => {})}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          )}
        </div>

        {/* Add a task form (inline toggle) */}
        {showForm && (
          <div className="border-t border-gray-100 p-5">
            <TaskForm
              courses={savedCourses}
              submitLabel="Create task"
              onCancel={() => setShowForm(false)}
              onSubmit={handleCreateTask}
            />
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add a Task
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Import Tasks From Calendar
          </button>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        title={editingTask ? `Edit ${editingTask.title}` : 'Edit task'}
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      >
        {editingTask ? (
          <TaskForm
            initialTask={editingTask}
            courses={savedCourses}
            submitLabel="Save changes"
            onCancel={() => setEditingTask(null)}
            onSubmit={async (payload) => {
              const ok = await handleUpdateTask(editingTask.id, payload);
              if (ok) setEditingTask(null);
              return ok;
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
