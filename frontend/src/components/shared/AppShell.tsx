import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
