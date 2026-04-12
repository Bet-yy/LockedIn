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
  low: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200',
  medium: 'border-amber-300/25 bg-amber-400/10 text-amber-200',
  high: 'border-coral-300/25 bg-coral-500/10 text-coral-100',
} as const;

export function TaskItem({ task, course, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const priorityStyle = task.priority ? priorityStyles[task.priority] : 'border-white/10 bg-white/5 text-sand-200/68';

  return (
    <article className="glass-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => void onToggleComplete(task)}
            className={[
              'mt-1 flex h-6 w-6 items-center justify-center rounded-full border transition',
              task.completed ? 'border-cyan-300 bg-cyan-400 text-ink-950' : 'border-white/20 bg-white/5 text-transparent hover:border-cyan-300/40',
            ].join(' ')}
            aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M7.629 13.233 4.396 10l-1.06 1.06 4.293 4.294L16.664 6.32l-1.06-1.06z" />
            </svg>
          </button>

          <div>
            <h3 className={['font-display text-xl font-semibold', task.completed ? 'text-sand-200/55 line-through' : 'text-sand-100'].join(' ')}>
              {task.title}
            </h3>
            {task.description ? <p className="mt-3 text-sm leading-6 text-sand-200/72">{task.description}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
              <span className={['rounded-full border px-3 py-1', priorityStyle].join(' ')}>{task.priority ?? 'No priority'}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sand-200/70">
                {task.due_date ? `Due ${task.due_date}` : 'No due date'}
              </span>
              {course ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sand-200/70">
                  {course.course_number}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-sand-100 transition hover:bg-white/10"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => void onDelete(task)}
            className="rounded-full border border-coral-300/20 bg-coral-500/10 px-4 py-2 text-sm font-medium text-coral-100 transition hover:bg-coral-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
