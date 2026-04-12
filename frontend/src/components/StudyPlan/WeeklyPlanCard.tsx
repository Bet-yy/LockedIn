import type { StudyPlanWeek } from '../../types/studyPlan';

interface WeeklyPlanCardProps {
  week: StudyPlanWeek;
}

export function WeeklyPlanCard({ week }: WeeklyPlanCardProps) {
  return (
    <article className="glass-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">Week {week.week}</p>
          <h3 className="mt-3 font-display text-xl font-semibold text-sand-100">{week.topic}</h3>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          {week.estimated_hours} hrs
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {week.daily_tasks.map((task, index) => (
          <div key={`${week.week}-${index}-${task}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-sand-200/78">
            {task}
          </div>
        ))}
      </div>
    </article>
  );
}
