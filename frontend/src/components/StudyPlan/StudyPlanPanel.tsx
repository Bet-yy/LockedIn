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
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">AI Study Plan</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-sand-100">Translate the syllabus into weekly execution</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-sand-200/74">
              Generate a study rhythm from the parsed syllabus so students can move from course overview to specific weekly commitments.
            </p>
          </div>
          <div className="flex items-end gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Weeks</span>
              <input
                type="number"
                min={1}
                max={20}
                value={weeksAvailable}
                onChange={(event) => setWeeksAvailable(Number(event.target.value) || 15)}
                className="w-24 rounded-full border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-sand-100 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => void onGenerate(weeksAvailable)}
              disabled={isLoading}
              className="rounded-full bg-coral-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {weeks.length ? 'Refresh Plan' : 'Generate Study Plan'}
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="glass-panel p-6">
          <LoadingSpinner label="Generating a weekly study plan..." />
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

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
