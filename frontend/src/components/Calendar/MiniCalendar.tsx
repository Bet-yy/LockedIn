import { useMemo, useState } from 'react';

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  color?: string; // tailwind bg class e.g. 'bg-violet-400'
  label?: string;
}

interface MiniCalendarProps {
  events?: CalendarEvent[];
  onDayClick?: (date: string) => void;
  selectedDate?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MiniCalendar({ events = [], onDayClick, selectedDate }: MiniCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const { firstDay, daysInMonth } = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1).getDay();
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    return { firstDay: first, daysInMonth: days };
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const cells: Array<{ day: number | null; key: string | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, key: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: toDateKey(viewYear, viewMonth, d) });
  }

  return (
    <div className="select-none">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="font-display text-sm font-semibold text-gray-800">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {DAYS.map((d) => (
          <span key={d} className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {d}
          </span>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {cells.map((cell, idx) => {
          if (!cell.day || !cell.key) {
            return <div key={`empty-${idx}`} />;
          }
          const key = cell.key;
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          const dayEvents = eventMap[key] ?? [];

          return (
            <button
              key={key}
              onClick={() => onDayClick?.(key)}
              className={[
                'relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-sm font-medium transition',
                isSelected
                  ? 'bg-violet-600 text-white'
                  : isToday
                  ? 'bg-violet-100 text-violet-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100',
              ].join(' ')}
            >
              {cell.day}
              {dayEvents.length > 0 && !isSelected && (
                <span className="absolute bottom-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span
                      key={i}
                      className={`h-1 w-1 rounded-full ${ev.color ?? 'bg-violet-400'}`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
