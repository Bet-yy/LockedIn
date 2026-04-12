import type { ResourceItem } from '../../types/studyPlan';

interface ResourceCardProps {
  resource: ResourceItem;
}

const resourceLabelMap = {
  video: 'Video',
  article: 'Article',
  practice: 'Practice',
} as const;

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="glass-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          {resourceLabelMap[resource.resource_type]}
        </span>
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-coral-200 transition hover:text-coral-100"
          >
            Open link
          </a>
        ) : null}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-sand-100">{resource.title}</h3>
      <p className="mt-3 text-sm leading-7 text-sand-200/72">{resource.description ?? 'No description provided.'}</p>
    </article>
  );
}
