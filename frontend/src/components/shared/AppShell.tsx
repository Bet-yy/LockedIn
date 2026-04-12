import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-fade bg-[size:52px_52px] opacity-[0.08]" />
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-64 h-80 w-80 rounded-full bg-coral-500/10 blur-3xl" />
      <Navbar />
      <main className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
