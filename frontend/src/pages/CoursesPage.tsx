import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedCourses, saveCourse, searchCourses } from '../api/courses';
import { SearchBar } from '../components/CourseSearch/SearchBar';
import { SearchResults } from '../components/CourseSearch/SearchResults';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { useCourseStore } from '../store/courseStore';
import type { CourseSearchResult } from '../types/course';

export function CoursesPage() {
  const navigate = useNavigate();
  const {
    searchResults,
    savedCourses,
    isSearching,
    searchError,
    lastQuery,
    setSearchResults,
    setSavedCourses,
    setSelectedCourse,
    upsertSavedCourse,
    setIsSearching,
    setSearchError,
    setLastQuery,
  } = useCourseStore();
  const [query, setQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const courses = await getSavedCourses();
        if (isMounted) setSavedCourses(courses);
      } catch {
        if (isMounted) setSearchError('Saved courses could not be loaded, but live search is still available.');
      }
    })();
    return () => { isMounted = false; };
  }, [setSavedCourses, setSearchError]);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!trimmedQuery) {
      setSearchResults([]);
      setLastQuery('');
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setLastQuery(trimmedQuery);

    void (async () => {
      try {
        const results = await searchCourses(trimmedQuery);
        if (requestIdRef.current === requestId) setSearchResults(results);
      } catch {
        if (requestIdRef.current === requestId) {
          setSearchResults([]);
          setSearchError('Course search failed. Check that the backend is running and try again.');
        }
      } finally {
        if (requestIdRef.current === requestId) setIsSearching(false);
      }
    })();
  }, [debouncedQuery, setIsSearching, setLastQuery, setSearchError, setSearchResults]);

  const recentCourses = useMemo(() => savedCourses.slice(0, 4), [savedCourses]);

  async function handleCourseSelect(course: CourseSearchResult) {
    setIsSaving(true);
    setSearchError(null);
    try {
      const savedCourse = await saveCourse(course);
      upsertSavedCourse(savedCourse);
      setSelectedCourse(savedCourse);
      navigate(`/course/${savedCourse.id}`);
    } catch {
      setSearchError('Saving the selected course failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="section-label">Courses</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">Course Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find a UTD class, save it, and turn it into a study workspace.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Search */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <SearchBar value={query} onChange={setQuery} />
            {isSaving && (
              <div className="mt-4">
                <LoadingSpinner label="Saving course and opening workspace…" compact />
              </div>
            )}
            {searchError && (
              <div className="mt-4">
                <ErrorBanner message={searchError} />
              </div>
            )}
          </div>
          <SearchResults
            query={lastQuery || query}
            results={searchResults}
            isLoading={isSearching}
            onSelect={handleCourseSelect}
          />
        </div>

        {/* Saved courses */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <p className="section-label">Saved Courses</p>
            <p className="mt-1 text-xs text-gray-400">
              Click a course to reopen its workspace.
            </p>
          </div>
          {recentCourses.length ? (
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="glass-panel w-full p-5 text-left transition hover:shadow-card-hover"
                >
                  <p className="section-label">{course.course_number}</p>
                  <h3 className="mt-2 font-display text-base font-semibold text-gray-900">{course.course_name}</h3>
                  <p className="mt-1 text-sm text-gray-400">{course.professor ?? 'Professor TBA'}</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved courses yet"
              description="Search for a course and select it to build your first workspace."
            />
          )}
        </div>
      </div>
    </div>
  );
}
