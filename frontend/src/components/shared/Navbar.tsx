import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Search', to: '/' },
  { label: 'Tasks', to: '/tasks' },
  { label: 'Timer', to: '/timer' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-400/10 font-display text-lg font-bold text-cyan-300">
            LI
          </div>
          <div>
            <p className="font-display text-lg font-bold text-sand-100">LockedIn</p>
            <p className="text-sm text-sand-200/70">Study system for UTD momentum</p>
          </div>
        </NavLink>

        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-cyan-400 text-ink-950'
                    : 'text-sand-100/75 hover:bg-white/10 hover:text-sand-100',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
