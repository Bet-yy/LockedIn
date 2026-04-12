import { useParams } from 'react-router-dom';
import { PageIntro } from '../components/shared/PageIntro';
import { StatusCard } from '../components/shared/StatusCard';

const tabs = ['Syllabus', 'Study Plan', 'Resources'];

export function CoursePage() {
  const { id } = useParams();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Course Workspace"
        title={`Course route ready for ${id ?? 'selected course'}`}
        description="This page is scaffolded for the next phase: a tabbed workspace where students can parse syllabi, generate study plans, and pull resource recommendations without leaving the course context."
      />

      <section className="glass-panel p-4">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                index === 0 ? 'bg-cyan-400 text-ink-950' : 'bg-white/5 text-sand-100/72 hover:bg-white/10',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <StatusCard
          title="Syllabus parsing slot"
          description="The syllabus API wrapper is already added. Phase 7 can attach the parse button, loading states, and structured rendering here."
        />
        <StatusCard
          title="Study plan slot"
          description="A typed `generateStudyPlan` helper and `StudyPlanWeek` models are in place so weekly cards can be rendered with minimal plumbing."
        />
        <StatusCard
          title="Resources slot"
          description="Resource generation and retrieval helpers are scaffolded for later tab content and revisit persistence."
        />
      </section>
    </div>
  );
}
