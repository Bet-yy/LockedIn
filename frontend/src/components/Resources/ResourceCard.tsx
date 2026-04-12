import type { ResourceItem } from '../../types/studyPlan';

interface ResourceCardProps {
  resource: ResourceItem;
}

const typeBadge = {
  video: 'border-red-200 bg-red-50 text-red-600',
  article: 'border-blue-200 bg-blue-50 text-blue-600',
  practice: 'border-emerald-200 bg-emerald-50 text-emerald-600',
} as const;

const resourceLabelMap = {
  video: 'Video',
  article: 'Article',
  practice: 'Practice',
} as const;

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="glass-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${typeBadge[resource.resource_type]}`}>
          {resourceLabelMap[resource.resource_type]}
        </span>
        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-violet-600 transition hover:text-violet-800"
          >
            Open link →
          </a>
        )}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-gray-900">{resource.title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-gray-500">{resource.description ?? 'No description provided.'}</p>
    </article>
  );
}
