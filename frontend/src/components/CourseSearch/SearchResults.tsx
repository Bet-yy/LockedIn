import type { CourseSearchResult } from '../../types/course';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SearchResultCard } from './SearchResultCard';

interface SearchResultsProps {
  query: string;
  results: CourseSearchResult[];
  isLoading: boolean;
  onSelect: (course: CourseSearchResult) => void;
}

export function SearchResults({ query, results, isLoading, onSelect }: SearchResultsProps) {
  if (!query.trim()) {
    return (
      <EmptyState
        title="Start with a course search"
        description="Search by course number, title, or professor to pull live UTD course data into your study workspace."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="glass-panel p-6">
        <LoadingSpinner label={`Searching for "${query}"...`} />
      </div>
    );
  }

  if (!results.length) {
    return (
      <EmptyState
        title="No matching courses"
        description="Try a course number like CS 3345 or switch to a broader title search."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {results.map((course) => (
        <SearchResultCard key={course.nebula_course_id} course={course} onSelect={onSelect} />
      ))}
    </div>
  );
}
