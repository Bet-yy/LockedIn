import { useState } from 'react';
import type { StudyPlanResponse } from '../../types/studyPlan';
import { EmptyState } from '../shared/EmptyState';
import { ErrorBanner } from '../shared/ErrorBanner';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { WeeklyPlanCard } from './WeeklyPlanCard';

interface StudyPlanPanelProps {
  plan: StudyPlanResponse | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: (weeksAvailable: number) => Promise<void>;
}

export function StudyPlanPanel({ plan, isLoading, error, onGenerate }: StudyPlanPanelProps) {
  const [weeksAvailable, setWeeksAvailable] = useState(15);
  const weeks = plan?.plan_content ?? [];

  return (
    <div className="space-y-5">
      <section className="glass-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">AI Study Plan</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-gray-900">Translate the syllabus into weekly execution</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Generate a study rhythm from the parsed syllabus to move from course overview to specific weekly commitments.
            </p>
          </div>
          <div className="flex items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Weeks</span>
              <input
                type="number"
                min={1}
                max={20}
                value={weeksAvailable}
                onChange={(e) => setWeeksAvailable(Number(e.target.value) || 15)}
                className="w-20 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </label>
            <button
              type="button"
              onClick={() => void onGenerate(weeksAvailable)}
              disabled={isLoading}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {weeks.length ? 'Refresh Plan' : 'Generate Study Plan'}
            </button>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="glass-panel p-6">
          <LoadingSpinner label="Generating a weekly study plan…" />
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {weeks.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {weeks.map((week) => (
            <WeeklyPlanCard key={`${week.week}-${week.topic}`} week={week} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No study plan yet"
          description="Generate a weekly plan after parsing the syllabus to get topics, daily tasks, and time estimates."
        />
      )}
    </div>
  );
}
