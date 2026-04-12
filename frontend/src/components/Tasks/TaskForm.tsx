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

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

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
    if (!title.trim()) return;
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
      <label className="block">
        <span className={labelClass}>Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Review hash tables lecture"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional notes, assignment details, or study goal"
          className={`${inputClass} resize-none`}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Due Date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
            className={inputClass}
          >
            <option value="">No priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Linked Course</span>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className={inputClass}
        >
          <option value="">No course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_number} – {course.course_name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
