import { Link } from 'react-router-dom';
import { PageIntro } from '../components/shared/PageIntro';
import { StatusCard } from '../components/shared/StatusCard';

const quickStartCards = [
  {
    title: 'Course Search',
    description:
      'Phase 6 plugs the Nebula search flow into this page. The route shell, API client, and course store are ready for it.',
    actionLabel: 'Open search flow',
    href: '/course/demo',
  },
  {
    title: 'Task Hub',
    description:
      'Phase 9 will add task CRUD here. The task API wrapper and store are already scaffolded so we can drop the UI in next.',
    actionLabel: 'Preview tasks page',
    href: '/tasks',
  },
  {
    title: 'Focus Timer',
    description:
      'Phase 8 is staged with a timer store and route so the Pomodoro experience can be layered in without rearranging the app.',
    actionLabel: 'Preview timer page',
    href: '/timer',
  },
];

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="glass-panel overflow-hidden p-8 md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <PageIntro
            eyebrow="Phase 5 Foundation"
            title="A fast front door for search, planning, and focus."
            description="The frontend scaffold is in place with routing, shared layout, Tailwind styling, Zustand stores, and typed API helpers. We can now build feature phases on top of a stable shell instead of starting from scratch."
          />

          <div className="rounded-[2rem] border border-white/10 bg-ink-900/80 p-6">
            <p className="section-label">Ready Next</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                <p className="text-sm font-semibold text-cyan-300">Search + Save Courses</p>
                <p className="mt-2 text-sm text-sand-200/72">
                  `/api/courses/search`, `/api/courses/save`, and the guest ID flow are already wired.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-sand-100">Tabbed Course Workspace</p>
                <p className="mt-2 text-sm text-sand-200/72">
                  The `/course/:id` route is live and ready for syllabus, plan, and resources tabs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {quickStartCards.map((card) => (
          <StatusCard
            key={card.title}
            title={card.title}
            description={card.description}
            action={
              <Link
                to={card.href}
                className="inline-flex items-center rounded-full bg-coral-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral-400"
              >
                {card.actionLabel}
              </Link>
            }
          />
        ))}
      </section>
    </div>
  );
}
