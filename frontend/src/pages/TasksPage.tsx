import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, listTasks, updateTask } from '../api/tasks';
import { getSavedCourses } from '../api/courses';
import { TaskFilters } from '../components/Tasks/TaskFilters';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TaskList } from '../components/Tasks/TaskList';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Modal } from '../components/shared/Modal';
import { PageIntro } from '../components/shared/PageIntro';
import { useCourseStore } from '../store/courseStore';
import { useTaskStore } from '../store/taskStore';
import type { Task, TaskPayload } from '../types/task';

function isDueToday(dueDate: string | null) {
  if (!dueDate) {
    return false;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return dueDate === `${year}-${month}-${day}`;
}

export function TasksPage() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {
    tasks,
    isLoading,
    error,
    activeFilter,
    selectedCourseId,
    setTasks,
    upsertTask,
    removeTask,
    setIsLoading,
    setError,
    setActiveFilter,
    setSelectedCourseId,
  } = useTaskStore();
  const { savedCourses, setSavedCourses } = useCourseStore();

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [tasksResponse, coursesResponse] = await Promise.all([listTasks(), getSavedCourses()]);
        if (!isMounted) {
          return;
        }
        setTasks(tasksResponse);
        setSavedCourses(coursesResponse);
      } catch {
        if (isMounted) {
          setError('Tasks could not be loaded. Check that the backend is running and try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [setError, setIsLoading, setSavedCourses, setTasks]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'completed') {
      return tasks.filter((task) => task.completed);
    }
    if (activeFilter === 'due_today') {
      return tasks.filter((task) => isDueToday(task.due_date));
    }
    if (activeFilter === 'course') {
      return tasks.filter((task) => (selectedCourseId ? task.course_id === selectedCourseId : true));
    }
    return tasks;
  }, [activeFilter, selectedCourseId, tasks]);

  async function handleCreateTask(payload: TaskPayload) {
    try {
      const task = await createTask(payload);
      upsertTask(task);
      setError(null);
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
      if (editingTask?.id === task.id) {
        setEditingTask(null);
      }
      setError(null);
    } catch {
      setError('Deleting the task failed. Please try again.');
    }
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Task Console"
        title="Track syllabus work, personal tasks, and what is due next."
        description="Create tasks manually, link them to saved courses, filter by completion or due date, and keep the to-do system close to the rest of your study workflow."
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6">
          <p className="section-label">Create Task</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-sand-100">Add the next piece of work</h2>
          <p className="mt-3 text-sm leading-7 text-sand-200/72">
            Manual tasks are part of the MVP flow, and course linking keeps them ready for future course-specific views.
          </p>
          <div className="mt-6">
            <TaskForm courses={savedCourses} onSubmit={handleCreateTask} submitLabel="Create task" />
          </div>
        </div>

        <div className="space-y-5">
          <TaskFilters
            activeFilter={activeFilter}
            selectedCourseId={selectedCourseId}
            courses={savedCourses}
            onFilterChange={setActiveFilter}
            onCourseChange={setSelectedCourseId}
          />
          {error ? <ErrorBanner message={error} /> : null}
          {isLoading ? (
            <div className="glass-panel p-6">
              <LoadingSpinner label="Loading tasks..." />
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              courses={savedCourses}
              onToggleComplete={async (task) => {
                await handleUpdateTask(task.id, { completed: !task.completed });
              }}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          )}
        </div>
      </section>

      <Modal title={editingTask ? `Edit ${editingTask.title}` : 'Edit task'} open={Boolean(editingTask)} onClose={() => setEditingTask(null)}>
        {editingTask ? (
          <TaskForm
            initialTask={editingTask}
            courses={savedCourses}
            submitLabel="Save changes"
            onCancel={() => setEditingTask(null)}
            onSubmit={async (payload) => {
              const wasSuccessful = await handleUpdateTask(editingTask.id, payload);
              if (wasSuccessful) {
                setEditingTask(null);
              }
              return wasSuccessful;
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
