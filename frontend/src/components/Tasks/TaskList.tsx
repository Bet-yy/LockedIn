import type { SavedCourse } from '../../types/course';
import type { Task } from '../../types/task';
import { EmptyState } from '../shared/EmptyState';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  courses: SavedCourse[];
  onToggleComplete: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
}

export function TaskList({ tasks, courses, onToggleComplete, onEdit, onDelete }: TaskListProps) {
  if (!tasks.length) {
    return (
      <EmptyState
        title="No tasks match this view"
        description="Create a task or switch filters to see the rest of your work."
      />
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          course={courses.find((course) => course.id === task.course_id)}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
