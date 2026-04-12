import { useEffect, useRef, useState } from 'react';
import type { CourseSearchResult } from '../../types/course';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: CourseSearchResult[];
  isLoading?: boolean;
  onSuggestionSelect?: (course: CourseSearchResult) => void;
}

export function SearchBar({ value, onChange, suggestions = [], isLoading = false, onSuggestionSelect }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Open dropdown whenever user has typed something
  useEffect(() => {
    if (value.trim()) {
      setOpen(true);
      setActiveIndex(-1);
    } else {
      setOpen(false);
    }
  }, [suggestions, value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function selectSuggestion(course: CourseSearchResult) {
    onChange(course.course_number);
    setOpen(false);
    setActiveIndex(-1);
    onSuggestionSelect?.(course);
    inputRef.current?.blur();
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block">
        <span className="section-label">Course Search</span>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
          {isLoading ? (
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-violet-200 border-t-violet-500" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          )}
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0 && value.trim()) setOpen(true); }}
            placeholder="Search by CS 3345, course title, or professor"
            className="w-full border-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="shrink-0 text-gray-300 transition hover:text-gray-500"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </label>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-card-hover">
          {isLoading ? (
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-500" />
              Searching…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              No courses found for <span className="font-medium text-gray-600">"{value}"</span>
            </div>
          ) : (
            <ul role="listbox" className="max-h-72 overflow-y-auto">
              {suggestions.map((course, index) => (
                <li
                  key={course.nebula_course_id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(course)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={[
                    'flex cursor-pointer items-start gap-3 px-4 py-3 transition',
                    index === activeIndex ? 'bg-violet-50' : 'hover:bg-gray-50',
                    index < suggestions.length - 1 ? 'border-b border-gray-100' : '',
                  ].join(' ')}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">
                        {course.course_number}
                      </span>
                      <span className="truncate text-sm font-medium text-gray-800">{course.course_name}</span>
                    </div>
                    {(course.professor || course.semester) && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {[course.professor, course.semester].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
