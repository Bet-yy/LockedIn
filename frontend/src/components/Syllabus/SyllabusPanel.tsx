import { useState } from 'react';
import type { SavedCourse } from '../../types/course';
import type { ParsedSyllabusData, ParseSyllabusResponse } from '../../types/studyPlan';
import { EmptyState } from '../shared/EmptyState';
import { ErrorBanner } from '../shared/ErrorBanner';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ParsedSyllabusCard } from './ParsedSyllabusCard';

interface SyllabusPanelProps {
  course: SavedCourse;
  syllabus: ParseSyllabusResponse | null;
  isLoading: boolean;
  error: string | null;
  onParse: (rawText?: string) => Promise<void>;
}

function isObject(value: unknown): value is ParsedSyllabusData {
  return typeof value === 'object' && value !== null;
}

export function SyllabusPanel({ course, syllabus, isLoading, error, onParse }: SyllabusPanelProps) {
  const [manualText, setManualText] = useState(course.syllabus_raw ?? '');
  const hasParsedSyllabus = isObject(syllabus?.syllabus_parsed);

  return (
    <div className="space-y-5">
      <section className="glass-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Syllabus Parsing</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-gray-900">Build a readable course brief</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Pull the syllabus into structured sections so you can skim deadlines and expectations at a glance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onParse(manualText.trim() || undefined)}
            disabled={isLoading}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasParsedSyllabus ? 'Re-parse Syllabus' : 'Parse Syllabus'}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">
            {course.syllabus_raw ? 'Raw syllabus cached' : 'No raw syllabus cached yet'}
          </span>
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">
            {course.syllabus_parsed ? 'Parsed syllabus found' : 'Needs parsing'}
          </span>
        </div>
      </section>

      {isLoading && (
        <div className="glass-panel p-6">
          <LoadingSpinner label="Parsing syllabus…" />
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {hasParsedSyllabus ? (
        <ParsedSyllabusCard data={syllabus?.syllabus_parsed as ParsedSyllabusData} />
      ) : (
        <EmptyState
          title="No parsed syllabus yet"
          description="Run syllabus parsing to extract weekly topics, exam dates, assignments, and grading details."
        />
      )}

      <section className="glass-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Manual Fallback</p>
            <h3 className="mt-1 font-display text-base font-semibold text-gray-900">Paste syllabus text if the PDF is missing</h3>
          </div>
          <span className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
            Optional
          </span>
        </div>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={8}
          placeholder="Paste syllabus text here if Nebula cannot provide a usable syllabus file."
          className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </section>
    </div>
  );
}
