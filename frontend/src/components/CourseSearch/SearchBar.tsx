interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="block">
      <span className="section-label">Course Search</span>
      <div className="mt-4 flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-ink-950/70 px-5 py-4 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by CS 3345, course title, or professor"
          className="w-full border-0 bg-transparent text-base text-sand-100 outline-none placeholder:text-sand-200/45"
        />
      </div>
    </label>
  );
}
