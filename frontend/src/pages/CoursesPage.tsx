import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCourse, getSavedCourses, saveCourse, searchCourses, updateCourse } from '../api/courses';
import { SearchBar } from '../components/CourseSearch/SearchBar';
import { SearchResults } from '../components/CourseSearch/SearchResults';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { useCourseStore } from '../store/courseStore';
import type { CourseSearchResult, SavedCourse } from '../types/course';

interface EditState {
  course_name: string;
  course_number: string;
  professor: string;
  semester: string;
}

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
    removeSavedCourse,
    setIsSearching,
    setSearchError,
    setLastQuery,
  } = useCourseStore();

  const [query, setQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<SavedCourse | null>(null);
  const [editState, setEditState] = useState<EditState>({ course_name: '', course_number: '', professor: '', semester: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
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

  function openEdit(course: SavedCourse) {
    setEditingCourse(course);
    setEditState({
      course_name: course.course_name,
      course_number: course.course_number,
      professor: course.professor ?? '',
      semester: course.semester ?? '',
    });
    setActionError(null);
  }

  async function handleSaveEdit() {
    if (!editingCourse) return;
    setIsSavingEdit(true);
    setActionError(null);
    try {
      const updated = await updateCourse(editingCourse.id, {
        course_name: editState.course_name.trim() || undefined,
        course_number: editState.course_number.trim() || undefined,
        professor: editState.professor.trim() || undefined,
        semester: editState.semester.trim() || undefined,
      });
      upsertSavedCourse(updated);
      setEditingCourse(null);
    } catch {
      setActionError('Failed to update course. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDelete(course: SavedCourse) {
    if (!confirm(`Delete "${course.course_name}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteCourse(course.id);
      removeSavedCourse(course.id);
    } catch {
      setActionError('Failed to delete course. Please try again.');
    }
  }

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

  const inputClass = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
  const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400';

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Courses</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">Course Search</h1>
        <p className="mt-1 text-sm text-gray-500">Find a UTD class, save it, and turn it into a study workspace.</p>
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Search */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <SearchBar
              value={query}
              onChange={setQuery}
              suggestions={searchResults}
              isLoading={isSearching}
            />
            {isSaving && <div className="mt-4"><LoadingSpinner label="Saving course…" compact /></div>}
            {searchError && <div className="mt-4"><ErrorBanner message={searchError} /></div>}
          </div>
          <SearchResults query={lastQuery || query} results={searchResults} isLoading={isSearching} onSelect={handleCourseSelect} />
        </div>

        {/* Saved courses */}
        <div className="space-y-3">
          <div className="glass-panel p-5">
            <p className="section-label">Saved Courses</p>
            <p className="mt-1 text-xs text-gray-400">{savedCourses.length} saved · click to open workspace</p>
          </div>

          {savedCourses.length ? (
            savedCourses.map((course) => (
              <div key={course.id} className="glass-panel overflow-hidden">
                {/* Edit form (inline, shown when editing this card) */}
                {editingCourse?.id === course.id ? (
                  <div className="p-4 space-y-3">
                    <p className="section-label">Edit Course</p>
                    <label className="block">
                      <span className={labelClass}>Course Number</span>
                      <input className={inputClass} value={editState.course_number} onChange={(e) => setEditState((s) => ({ ...s, course_number: e.target.value }))} />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Course Name</span>
                      <input className={inputClass} value={editState.course_name} onChange={(e) => setEditState((s) => ({ ...s, course_name: e.target.value }))} />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Professor</span>
                      <input className={inputClass} value={editState.professor} onChange={(e) => setEditState((s) => ({ ...s, professor: e.target.value }))} />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Semester</span>
                      <input className={inputClass} placeholder="e.g. 25S" value={editState.semester} onChange={(e) => setEditState((s) => ({ ...s, semester: e.target.value }))} />
                    </label>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { void handleSaveEdit(); }}
                        disabled={isSavingEdit}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                      >
                        {isSavingEdit ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingCourse(null)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal card view */
                  <div className="flex items-start gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="section-label">{course.course_number}</p>
                      <h3 className="mt-1 font-display text-sm font-semibold text-gray-900">{course.course_name}</h3>
                      <p className="mt-0.5 text-xs text-gray-400">{course.professor ?? 'Professor TBA'}{course.semester ? ` · ${course.semester}` : ''}</p>
                    </button>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => openEdit(course)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { void handleDelete(course); }}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <EmptyState title="No saved courses yet" description="Search for a course and select it to build your first workspace." />
          )}
        </div>
      </div>
    </div>
  );
}
