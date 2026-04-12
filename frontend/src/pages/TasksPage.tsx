import { PageIntro } from '../components/shared/PageIntro';
import { StatusCard } from '../components/shared/StatusCard';

export function TasksPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Task Console"
        title="Task CRUD page scaffolded for phase 9."
        description="The route exists, the task store exists, and the API helpers for list/create/update/delete are already typed. What remains is the interactive list, filters, and form components."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusCard
          title="Incoming capabilities"
          description="Task filters, course assignments, completion toggles, and modal editing can be layered in here without changing the routing or data foundations."
        />
        <StatusCard
          title="Backend already ready"
          description="`GET`, `POST`, `PATCH`, and `DELETE` wrappers are connected to the FastAPI tasks routes and automatically include the guest ID query parameter."
        />
      </div>
    </div>
  );
}
