import { useState } from 'react';
import type { ResourceItem } from '../../types/studyPlan';
import { EmptyState } from '../shared/EmptyState';
import { ErrorBanner } from '../shared/ErrorBanner';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ResourceCard } from './ResourceCard';

interface ResourcesPanelProps {
  resources: ResourceItem[];
  isLoading: boolean;
  error: string | null;
  onGenerate: (topic?: string) => Promise<void>;
}

export function ResourcesPanel({ resources, isLoading, error, onGenerate }: ResourcesPanelProps) {
  const [topic, setTopic] = useState('');

  return (
    <div className="space-y-5">
      <section className="glass-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Resource Recommendations</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-gray-900">Pull high-signal study material fast</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Generate a mix of videos, articles, and practice material for the course topic or a narrower concept.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onGenerate(topic.trim() || undefined)}
            disabled={isLoading}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resources.length ? 'Refresh Resources' : 'Find Resources'}
          </button>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Optional topic override</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: graph traversal, recursion, linked lists"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </label>
      </section>

      {isLoading && (
        <div className="glass-panel p-6">
          <LoadingSpinner label="Finding study resources…" />
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {resources.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {resources.map((resource, index) => (
            <ResourceCard key={`${resource.title}-${index}`} resource={resource} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No resources generated yet"
          description="Generate recommendations to get a quick stack of videos, articles, and practice material for the course."
        />
      )}
    </div>
  );
}
