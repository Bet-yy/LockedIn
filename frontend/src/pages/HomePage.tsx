import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedCourses, saveCourse, searchCourses } from '../api/courses';
import { SearchBar } from '../components/CourseSearch/SearchBar';
import { SearchResults } from '../components/CourseSearch/SearchResults';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { PageIntro } from '../components/shared/PageIntro';
import { StatusCard } from '../components/shared/StatusCard';
import { useDebounce } from '../hooks/useDebounce';
import { useCourseStore } from '../store/courseStore';
import type { CourseSearchResult } from '../types/course';

export function HomePage() {
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
        if (isMounted) {
          setSavedCourses(courses);
        }
      } catch {
        if (isMounted) {
          setSearchError('Saved courses could not be loaded yet, but live search is still available.');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
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
        if (requestIdRef.current === requestId) {
          setSearchResults(results);
        }
      } catch {
        if (requestIdRef.current === requestId) {
          setSearchResults([]);
          setSearchError('Course search failed. Check that the backend is running and try again.');
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsSearching(false);
        }
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
    <div className="space-y-8">
      <section className="glass-panel overflow-hidden p-8 md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <PageIntro
            eyebrow="Course Search"
            title="Find a class, save it, and turn it into a study workspace."
            description="Search the UTD catalog, pull a course into LockedIn, then use syllabus parsing, study plans, resource recommendations, tasks, and timer support without leaving the app."
          />

          <div className="rounded-[2rem] border border-white/10 bg-ink-900/80 p-6">
            <p className="section-label">Momentum Snapshot</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                <p className="text-sm font-semibold text-cyan-300">Search + Save Courses</p>
                <p className="mt-2 text-sm text-sand-200/72">
                  Live Nebula search and saved-course persistence are wired through the existing guest flow.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-sand-100">What happens next</p>
                <p className="mt-2 text-sm text-sand-200/72">
                  Saved courses open into a dedicated workspace where syllabus, study plan, and resources can be generated on demand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <div className="glass-panel p-6">
            <SearchBar value={query} onChange={setQuery} />
            {isSaving ? (
              <div className="mt-5">
                <LoadingSpinner label="Saving course and opening workspace..." compact />
              </div>
            ) : null}
            {searchError ? (
              <div className="mt-5">
                <ErrorBanner message={searchError} />
              </div>
            ) : null}
          </div>
          <SearchResults query={lastQuery || query} results={searchResults} isLoading={isSearching} onSelect={handleCourseSelect} />
        </div>

        <div className="space-y-6">
          <StatusCard
            title="Recent saved courses"
            description="Everything saved here can be reopened later with stored syllabus, plan, and resource data."
          />
          {recentCourses.length ? (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="glass-panel w-full p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/30"
                >
                  <p className="section-label">{course.course_number}</p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-sand-100">{course.course_name}</h3>
                  <p className="mt-3 text-sm text-sand-200/70">{course.professor ?? 'Professor to be announced'}</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved courses yet"
              description="Pick a course from search results to build your first study workspace."
            />
          )}
        </div>
      </section>
    </div>
  );
}
