import type { ParsedSyllabusData, SyllabusExamDate, SyllabusTopicWeek } from '../../types/studyPlan';

interface ParsedSyllabusCardProps {
  data: ParsedSyllabusData;
}

function renderObjectList(items: Record<string, string>) {
  return Object.entries(items).map(([label, value]) => (
    <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-500">{value}</span>
    </div>
  ));
}

export function ParsedSyllabusCard({ data }: ParsedSyllabusCardProps) {
  const topics: SyllabusTopicWeek[] = Array.isArray(data.topics_by_week)
    ? (data.topics_by_week as unknown[]).map((t, i) => {
        if (t && typeof t === 'object') return t as SyllabusTopicWeek;
        return { week: i + 1, topic: String(t) };
      })
    : [];

  const exams: SyllabusExamDate[] = Array.isArray(data.exam_dates)
    ? (data.exam_dates as unknown[]).map((e) => {
        if (e && typeof e === 'object') return e as SyllabusExamDate;
        return { name: String(e), date: '' };
      })
    : [];
  const grading =
    data.grading_breakdown && typeof data.grading_breakdown === 'object' && !Array.isArray(data.grading_breakdown)
      ? (data.grading_breakdown as Record<string, string>)
      : null;
  // Assignments can be: string[], object[], or a key→value record
  const assignments: string[] = (() => {
    if (!data.assignments) return [];
    if (Array.isArray(data.assignments)) {
      return (data.assignments as unknown[]).map((a) => {
        if (typeof a === 'string') return a;
        if (a && typeof a === 'object') {
          const obj = a as Record<string, unknown>;
          // Handle {name, weight, due_date} shape from Gemini
          const parts = [obj.name, obj.weight, obj.due_date].filter(Boolean);
          return parts.length ? parts.join(' · ') : JSON.stringify(obj);
        }
        return String(a);
      });
    }
    if (typeof data.assignments === 'object') {
      return Object.entries(data.assignments as Record<string, string>).map(
        ([key, value]) => `${key}: ${value}`,
      );
    }
    return [];
  })();

  return (
    <div className="space-y-5">
      {data.course_description && (
        <section className="glass-panel p-5">
          <p className="section-label">Description</p>
          <p className="mt-3 text-sm leading-6 text-gray-600">{data.course_description}</p>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass-panel p-5">
          <p className="section-label">Topics By Week</p>
          <div className="mt-3 space-y-2">
            {topics.length ? (
              topics.map((item, index) => (
                <div key={`${item.week}-${item.topic}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">Week {item.week}</p>
                  <p className="mt-1 text-sm text-gray-700">{item.topic}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No weekly topic outline was returned.</p>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <div className="glass-panel p-5">
            <p className="section-label">Exam Dates</p>
            <div className="mt-3 space-y-2">
              {exams.length ? (
                exams.map((item) => (
                  <div key={`${item.name}-${item.date}`} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No exam schedule was extracted.</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-5">
            <p className="section-label">Grading Breakdown</p>
            <div className="mt-3 space-y-2">
              {grading ? renderObjectList(grading) : <p className="text-sm text-gray-400">No grading weights were extracted.</p>}
            </div>
          </div>

          <div className="glass-panel p-5">
            <p className="section-label">Assignments</p>
            <div className="mt-3 space-y-2">
              {assignments.length ? (
                assignments.map((assignment) => (
                  <div key={assignment} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
                    {assignment}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No assignments list was extracted.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
