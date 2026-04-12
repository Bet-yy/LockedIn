import { NavLink } from 'react-router-dom';
import { useTimerStore } from '../../store/timerStore';

const navItems = [
  {
    label: 'Home',
    to: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6h-6v6H3.75A.75.75 0 013 21V9.75z" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    to: '/calendar',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: 'Courses',
    to: '/courses',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    label: 'To-Do List',
    to: '/to-do-list',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function Sidebar() {
  const { secondsLeft, mode, isRunning } = useTimerStore();

  const modeColor =
    mode === 'work' ? 'text-violet-300' : mode === 'short_break' ? 'text-emerald-300' : 'text-amber-300';

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-sidebar text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/30 font-display text-sm font-bold text-violet-200">
          LI
        </div>
        <span className="font-display text-xl font-bold tracking-wide text-white">LOCKED IN</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Navigation</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/8 hover:text-white/90',
                  ].join(' ')
                }
              >
                <span className="shrink-0">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Timer widget at bottom */}
      <div className="mx-3 mb-4 rounded-xl bg-white/8 p-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          {mode === 'work' ? 'Work Session' : mode === 'short_break' ? 'Short Break' : 'Long Break'}
        </p>
        <p className={`font-display text-3xl font-bold tabular-nums ${modeColor}`}>
          {formatTime(secondsLeft)}
        </p>
        <p className="mt-1 text-xs text-white/40">{isRunning ? 'Running…' : 'Paused'}</p>
      </div>
    </aside>
  );
}
