import type { ParsedSyllabusData, SyllabusExamDate, SyllabusTopicWeek } from '../../types/studyPlan';

interface ParsedSyllabusCardProps {
  data: ParsedSyllabusData;
}

function renderObjectList(items: Record<string, string>) {
  return Object.entries(items).map(([label, value]) => (
    <div key={label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
      <span className="text-sand-100">{label}</span>
      <span className="text-sand-200/70">{value}</span>
    </div>
  ));
}

export function ParsedSyllabusCard({ data }: ParsedSyllabusCardProps) {
  const topics = Array.isArray(data.topics_by_week) ? (data.topics_by_week as SyllabusTopicWeek[]) : [];
  const exams = Array.isArray(data.exam_dates) ? (data.exam_dates as SyllabusExamDate[]) : [];
  const grading =
    data.grading_breakdown && typeof data.grading_breakdown === 'object' && !Array.isArray(data.grading_breakdown)
      ? (data.grading_breakdown as Record<string, string>)
      : null;
  const assignments = Array.isArray(data.assignments)
    ? data.assignments
    : data.assignments && typeof data.assignments === 'object'
      ? Object.entries(data.assignments as Record<string, string>).map(([key, value]) => `${key}: ${value}`)
      : [];

  return (
    <div className="space-y-6">
      {data.course_description ? (
        <section className="glass-panel p-6">
          <p className="section-label">Description</p>
          <p className="mt-4 text-sm leading-7 text-sand-200/78">{data.course_description}</p>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel p-6">
          <p className="section-label">Topics By Week</p>
          <div className="mt-4 space-y-3">
            {topics.length ? (
              topics.map((item, index) => (
                <div key={`${item.week}-${item.topic}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/85">Week {item.week}</p>
                  <p className="mt-2 text-sm text-sand-100">{item.topic}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-sand-200/68">No weekly topic outline was returned.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-panel p-6">
            <p className="section-label">Exam Dates</p>
            <div className="mt-4 space-y-3">
              {exams.length ? (
                exams.map((item) => (
                  <div key={`${item.name}-${item.date}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-semibold text-sand-100">{item.name}</p>
                    <p className="mt-1 text-sm text-sand-200/68">{item.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-sand-200/68">No exam schedule was extracted.</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <p className="section-label">Grading Breakdown</p>
            <div className="mt-4 space-y-3">
              {grading ? renderObjectList(grading) : <p className="text-sm text-sand-200/68">No grading weights were extracted.</p>}
            </div>
          </div>

          <div className="glass-panel p-6">
            <p className="section-label">Assignments</p>
            <div className="mt-4 space-y-2">
              {assignments.length ? (
                assignments.map((assignment) => (
                  <div key={assignment} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-sand-200/78">
                    {assignment}
                  </div>
                ))
              ) : (
                <p className="text-sm text-sand-200/68">No assignments list was extracted.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
