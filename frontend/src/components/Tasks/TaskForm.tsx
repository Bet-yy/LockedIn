import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { SavedCourse } from '../../types/course';
import type { Task, TaskPayload, TaskPriority } from '../../types/task';

interface TaskFormProps {
  initialTask?: Task | null;
  courses: SavedCourse[];
  onSubmit: (payload: TaskPayload) => Promise<boolean>;
  onCancel?: () => void;
  submitLabel: string;
}

export function TaskForm({ initialTask, courses, onSubmit, onCancel, submitLabel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [dueDate, setDueDate] = useState(initialTask?.due_date ?? '');
  const [priority, setPriority] = useState<TaskPriority | ''>(initialTask?.priority ?? '');
  const [courseId, setCourseId] = useState(initialTask?.course_id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialTask?.title ?? '');
    setDescription(initialTask?.description ?? '');
    setDueDate(initialTask?.due_date ?? '');
    setPriority(initialTask?.priority ?? '');
    setCourseId(initialTask?.course_id ?? '');
  }, [initialTask]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const wasSuccessful = await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        priority: priority || null,
        course_id: courseId || null,
      });

      if (wasSuccessful && !initialTask) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority('');
        setCourseId('');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Review hash tables lecture"
            className="w-full rounded-[1.5rem] border border-white/10 bg-ink-950/80 px-4 py-4 text-sm text-sand-100 outline-none placeholder:text-sand-200/45"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Optional notes, assignment details, or study goal"
            className="w-full rounded-[1.5rem] border border-white/10 bg-ink-950/80 px-4 py-4 text-sm text-sand-100 outline-none placeholder:text-sand-200/45"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-full border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-sand-100 outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority | '')}
            className="w-full rounded-full border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-sand-100 outline-none"
          >
            <option value="">No priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Linked course</span>
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="w-full rounded-full border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-sand-100 outline-none"
          >
            <option value="">No course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_number} - {course.course_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-coral-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-sand-100 transition hover:bg-white/10"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
