import type { CourseSearchResult } from '../../types/course';

interface SearchResultCardProps {
  course: CourseSearchResult;
  onSelect: (course: CourseSearchResult) => void;
}

export function SearchResultCard({ course, onSelect }: SearchResultCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(course)}
      className="glass-panel w-full p-4 text-left transition hover:shadow-card-hover"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label">{course.course_number}</p>
          <h3 className="mt-1.5 font-display text-base font-semibold text-gray-900">{course.course_name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {course.professor ?? 'Professor TBA'}
            {course.semester ? ` · ${course.semester}` : ''}
          </p>
        </div>
        <span className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
          Open Workspace
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {course.syllabus_url ? 'Syllabus available.' : 'No syllabus link — manual fallback supported.'}
      </p>
    </button>
  );
}
