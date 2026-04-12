import type { StudyPlanWeek } from '../../types/studyPlan';

interface WeeklyPlanCardProps {
  week: StudyPlanWeek;
}

export function WeeklyPlanCard({ week }: WeeklyPlanCardProps) {
  return (
    <article className="glass-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">Week {week.week}</p>
          <h3 className="mt-1 font-display text-base font-semibold text-gray-900">{week.topic}</h3>
        </div>
        <span className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
          {week.estimated_hours} hrs
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {week.daily_tasks.map((task, index) => (
          <div key={`${week.week}-${index}-${task}`} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
            {task}
          </div>
        ))}
      </div>
    </article>
  );
}
