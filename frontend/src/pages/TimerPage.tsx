import { PageIntro } from '../components/shared/PageIntro';
import { StatusCard } from '../components/shared/StatusCard';

export function TimerPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Pomodoro Route"
        title="Timer foundation ready for the client-side focus flow."
        description="Phase 8 can now focus on timer behavior instead of setup. The route, store skeleton, and interval hook are already in place for countdown logic, session transitions, and persistence."
      />

      <StatusCard
        title="What plugs in next"
        description="Timer controls, configurable durations, browser notifications, and localStorage persistence can all be added on this page without revisiting the scaffold."
      />
    </div>
  );
}
