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
      className="glass-panel w-full p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.075]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">{course.course_number}</p>
          <h3 className="mt-3 font-display text-xl font-semibold text-sand-100">{course.course_name}</h3>
          <p className="mt-3 text-sm text-sand-200/75">
            {course.professor ?? 'Professor to be announced'}
            {course.semester ? ` - ${course.semester}` : ''}
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Open Workspace
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-sand-200/68">
        {course.syllabus_url ? 'Syllabus available through Nebula.' : 'No syllabus link yet - manual fallback supported.'}
      </p>
    </button>
  );
}
