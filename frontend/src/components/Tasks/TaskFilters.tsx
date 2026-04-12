import type { SavedCourse } from '../../types/course';
import type { TaskFilter } from '../../store/taskStore';

interface TaskFiltersProps {
  activeFilter: TaskFilter;
  selectedCourseId: string;
  courses: SavedCourse[];
  onFilterChange: (filter: TaskFilter) => void;
  onCourseChange: (courseId: string) => void;
}

const filterOptions: Array<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'due_today', label: 'Due Today' },
  { value: 'course', label: 'By Course' },
];

export function TaskFilters({
  activeFilter,
  selectedCourseId,
  courses,
  onFilterChange,
  onCourseChange,
}: TaskFiltersProps) {
  return (
    <div className="glass-panel p-5">
      <div className="flex flex-wrap items-center gap-3">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onFilterChange(option.value)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              activeFilter === option.value ? 'bg-cyan-400 text-ink-950' : 'bg-white/5 text-sand-100/75 hover:bg-white/10',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
        {activeFilter === 'course' ? (
          <select
            value={selectedCourseId}
            onChange={(event) => onCourseChange(event.target.value)}
            className="rounded-full border border-white/10 bg-ink-950/80 px-4 py-2 text-sm text-sand-100 outline-none"
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_number} - {course.course_name}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}
