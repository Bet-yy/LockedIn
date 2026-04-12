interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="block">
      <span className="section-label">Course Search</span>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by CS 3345, course title, or professor"
          className="w-full border-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}
