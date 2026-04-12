import type { ReactNode } from 'react';

interface StatusCardProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function StatusCard({ title, description, action }: StatusCardProps) {
  return (
    <article className="glass-panel p-6">
      <h2 className="font-display text-xl font-semibold text-sand-100">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-sand-200/72">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </article>
  );
}
