import type { HabitDayCell } from "../../lib/habits";

interface HabitWeekStripProps {
  days: HabitDayCell[];
}

export function HabitWeekStrip({ days }: HabitWeekStripProps) {
  return (
    <div className="habit-week-strip" aria-label="Weekly active day tracker">
      {days.map((day) => (
        <article
          key={day.date}
          className={`habit-day ${day.isActive ? "active" : "inactive"} ${
            day.isToday ? "today" : ""
          }`.trim()}
        >
          <span className="habit-day-label">{day.shortLabel}</span>
          <strong>{day.isActive ? day.entryCount : 0}</strong>
          <small>{day.isActive ? "active" : "rest"}</small>
        </article>
      ))}
    </div>
  );
}
