import type { SavedCourse } from '../../types/course';
import type { Task } from '../../types/task';

interface TaskItemProps {
  task: Task;
  course?: SavedCourse;
  onToggleComplete: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
}

const priorityStyles = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-red-200 bg-red-50 text-red-700',
} as const;

const priorityDot = {
  low: 'bg-emerald-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
} as const;

export function TaskItem({ task, course, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const dotColor = task.priority ? priorityDot[task.priority] : 'bg-gray-300';
  const badgeStyle = task.priority ? priorityStyles[task.priority] : 'border-gray-200 bg-gray-50 text-gray-500';

  return (
    <article className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => void onToggleComplete(task)}
        className={[
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
          task.completed
            ? 'border-violet-500 bg-violet-500 text-white'
            : 'border-gray-300 bg-white text-transparent hover:border-violet-400',
        ].join(' ')}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
          <path d="M7.629 13.233 4.396 10l-1.06 1.06 4.293 4.294L16.664 6.32l-1.06-1.06z" />
        </svg>
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
          <p className={['text-sm font-semibold', task.completed ? 'text-gray-400 line-through' : 'text-gray-800'].join(' ')}>
            {task.title}
          </p>
        </div>
        {task.description && (
          <p className="mt-0.5 truncate text-xs text-gray-400">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {task.priority && (
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeStyle}`}>
              {task.priority}
            </span>
          )}
          {task.due_date && (
            <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              Due {task.due_date}
            </span>
          )}
          {course && (
            <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
              {course.course_number}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => void onDelete(task)}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
