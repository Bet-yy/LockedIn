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
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Resource Recommendations</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-sand-100">Pull high-signal study material fast</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-sand-200/74">
              Generate a mix of videos, articles, and practice material from the course topic or a narrower concept you want to focus on.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onGenerate(topic.trim() || undefined)}
            disabled={isLoading}
            className="rounded-full bg-coral-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resources.length ? 'Refresh Resources' : 'Find Resources'}
          </button>
        </div>
        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sand-200/62">Optional topic override</span>
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Ex: graph traversal, recursion, linked lists"
            className="w-full rounded-[1.5rem] border border-white/10 bg-ink-950/80 px-4 py-4 text-sm text-sand-100 outline-none placeholder:text-sand-200/45"
          />
        </label>
      </section>

      {isLoading ? (
        <div className="glass-panel p-6">
          <LoadingSpinner label="Finding study resources..." />
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

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
