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
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Syllabus Parsing</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-sand-100">Build a readable course brief</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-sand-200/74">
              Pull the syllabus into structured sections so students can skim the semester, deadlines, and course expectations without reading the full PDF every time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onParse(manualText.trim() || undefined)}
            disabled={isLoading}
            className="rounded-full bg-coral-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasParsedSyllabus ? 'Re-parse Syllabus' : 'Parse Syllabus'}
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-sand-200/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{course.syllabus_raw ? 'Raw syllabus cached' : 'No raw syllabus cached yet'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            {course.syllabus_parsed ? 'Parsed syllabus found' : 'Needs parsing'}
          </span>
        </div>
      </section>

      {isLoading ? (
        <div className="glass-panel p-6">
          <LoadingSpinner label="Parsing syllabus and saving the structured result..." />
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      {hasParsedSyllabus ? (
        <ParsedSyllabusCard data={syllabus?.syllabus_parsed as ParsedSyllabusData} />
      ) : (
        <EmptyState
          title="No parsed syllabus yet"
          description="Run syllabus parsing to extract weekly topics, exam dates, assignments, and grading details."
        />
      )}

      <section className="glass-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Manual Fallback</p>
            <h3 className="mt-3 font-display text-xl font-semibold text-sand-100">Paste syllabus text if the PDF is missing</h3>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Optional
          </span>
        </div>
        <textarea
          value={manualText}
          onChange={(event) => setManualText(event.target.value)}
          rows={10}
          placeholder="Paste syllabus text here if Nebula cannot provide a usable syllabus file."
          className="mt-5 w-full rounded-[1.5rem] border border-white/10 bg-ink-950/75 px-4 py-4 text-sm leading-7 text-sand-100 outline-none placeholder:text-sand-200/45"
        />
      </section>
    </div>
  );
}
