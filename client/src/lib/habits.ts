import type { Workout } from "../types/workout";

export const weeklyHabitTarget = 3;

type HabitTone = "positive" | "neutral" | "attention";

interface DayAggregate {
  entryCount: number;
  totalVolume: number;
}

export interface HabitDayCell {
  date: string;
  label: string;
  shortLabel: string;
  isActive: boolean;
  entryCount: number;
  totalVolume: number;
  isToday: boolean;
}

export interface HabitWeekSummary {
  weekStart: string;
  weekEnd: string;
  label: string;
  activeDays: number;
  entryCount: number;
  totalVolume: number;
  completionRate: number;
  meetsTarget: boolean;
  tone: HabitTone;
  statusLabel: string;
  statusDetail: string;
  daysToTarget: number;
  remainingDays: number;
  days: HabitDayCell[];
}

export interface HabitSnapshot {
  weeklyTarget: number;
  currentWeek: HabitWeekSummary;
  recentWeeks: HabitWeekSummary[];
  recentFortnight: HabitDayCell[];
  currentWeekTargetStreak: number;
  longestWeekTargetStreak: number;
  currentActiveDayStreak: number;
  longestActiveDayStreak: number;
  activeDaysLast7: number;
  activeDaysLast30: number;
  daysSinceLastWorkout: number | null;
  statusLabel: string;
  statusDetail: string;
  tone: HabitTone;
  encouragement: string;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function toDateKey(value: Date) {
  return startOfDay(value).toISOString().slice(0, 10);
}

function formatShortDay(value: Date) {
  return value.toLocaleDateString(undefined, { weekday: "short" });
}

function formatRangeLabel(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    })} - ${end.toLocaleDateString(undefined, { day: "numeric" })}`;
  }

  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })} - ${end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })}`;
}

function getWeekStart(value: Date | string) {
  const date = typeof value === "string" ? parseDate(value) : startOfDay(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekdayIndex(value: Date) {
  const day = value.getDay();
  return day === 0 ? 6 : day - 1;
}

function buildDayAggregates(workouts: Workout[]) {
  const grouped = new Map<string, DayAggregate>();

  for (const workout of workouts) {
    const current = grouped.get(workout.date) ?? {
      entryCount: 0,
      totalVolume: 0
    };

    current.entryCount += 1;
    current.totalVolume += workout.sets * workout.reps * workout.weight;
    grouped.set(workout.date, current);
  }

  return grouped;
}

function buildDayCell(
  value: Date,
  groupedDays: Map<string, DayAggregate>,
  todayKey: string
): HabitDayCell {
  const dateKey = toDateKey(value);
  const aggregate = groupedDays.get(dateKey);
  const label = formatShortDay(value);

  return {
    date: dateKey,
    label,
    shortLabel: label.slice(0, 1),
    isActive: aggregate !== undefined,
    entryCount: aggregate?.entryCount ?? 0,
    totalVolume: aggregate?.totalVolume ?? 0,
    isToday: dateKey === todayKey
  };
}

function buildWeekSummary(
  weekStart: Date,
  groupedDays: Map<string, DayAggregate>,
  referenceDate: Date,
  target: number
): HabitWeekSummary {
  const today = startOfDay(referenceDate);
  const todayKey = toDateKey(today);
  const currentWeekStart = toDateKey(getWeekStart(today));
  const isCurrentWeek = toDateKey(weekStart) === currentWeekStart;
  const days = Array.from({ length: 7 }, (_, index) =>
    buildDayCell(addDays(weekStart, index), groupedDays, todayKey)
  );
  const activeDays = days.filter((day) => day.isActive).length;
  const entryCount = days.reduce((sum, day) => sum + day.entryCount, 0);
  const totalVolume = days.reduce((sum, day) => sum + day.totalVolume, 0);
  const daysToTarget = Math.max(target - activeDays, 0);
  const remainingDays = isCurrentWeek ? 7 - getWeekdayIndex(today) : 0;
  const meetsTarget = activeDays >= target;
  const completionRate = Math.min(100, Math.round((activeDays / target) * 100));

  let tone: HabitTone = "neutral";
  let statusLabel = "Building rhythm";
  let statusDetail = `${activeDays} of ${target} active days are logged for this week.`;

  if (meetsTarget) {
    tone = "positive";
    statusLabel = isCurrentWeek ? "On track" : "Target hit";
    statusDetail = `${activeDays} active day${activeDays === 1 ? "" : "s"} locked in this week, which clears your ${target}-day baseline.`;
  } else if (isCurrentWeek) {
    const canStillHitTarget = activeDays + remainingDays >= target;

    if (!canStillHitTarget) {
      tone = "attention";
      statusLabel = "Behind pace";
      statusDetail = `This week needs ${daysToTarget} more active day${daysToTarget === 1 ? "" : "s"}, but only ${remainingDays} day${remainingDays === 1 ? "" : "s"} remain in the week.`;
    } else if (daysToTarget === 1) {
      tone = "neutral";
      statusLabel = "Close to target";
      statusDetail = `One more active day this week will complete your ${target}-day consistency target.`;
    } else if (daysToTarget >= remainingDays) {
      tone = "attention";
      statusLabel = "Window is tightening";
      statusDetail = `${daysToTarget} active day${daysToTarget === 1 ? "" : "s"} are still needed across the final ${remainingDays} day${remainingDays === 1 ? "" : "s"} of the week.`;
    }
  } else if (activeDays === 0) {
    tone = "attention";
    statusLabel = "Missed week";
    statusDetail = "No active training days landed in this week.";
  } else if (activeDays === target - 1) {
    tone = "neutral";
    statusLabel = "Almost there";
    statusDetail = `That week finished one active day short of your ${target}-day baseline.`;
  } else {
    tone = "attention";
    statusLabel = "Below target";
    statusDetail = `${activeDays} active day${activeDays === 1 ? "" : "s"} were logged in that week, below the ${target}-day baseline.`;
  }

  return {
    weekStart: toDateKey(weekStart),
    weekEnd: toDateKey(addDays(weekStart, 6)),
    label: isCurrentWeek ? "This week" : formatRangeLabel(weekStart, addDays(weekStart, 6)),
    activeDays,
    entryCount,
    totalVolume,
    completionRate,
    meetsTarget,
    tone,
    statusLabel,
    statusDetail,
    daysToTarget,
    remainingDays,
    days
  };
}

function countActiveDaysWithin(
  groupedDays: Map<string, DayAggregate>,
  referenceDate: Date,
  days: number
) {
  let count = 0;

  for (let index = 0; index < days; index += 1) {
    const key = toDateKey(addDays(referenceDate, -index));

    if (groupedDays.has(key)) {
      count += 1;
    }
  }

  return count;
}

function buildRecentFortnight(
  groupedDays: Map<string, DayAggregate>,
  referenceDate: Date
) {
  const today = startOfDay(referenceDate);
  const todayKey = toDateKey(today);

  return Array.from({ length: 14 }, (_, index) =>
    buildDayCell(addDays(today, index - 13), groupedDays, todayKey)
  );
}

function buildActiveDayStreaks(sortedActiveDays: string[]) {
  if (sortedActiveDays.length === 0) {
    return {
      current: 0,
      longest: 0
    };
  }

  let longest = 1;
  let running = 1;

  for (let index = 1; index < sortedActiveDays.length; index += 1) {
    const previous = parseDate(sortedActiveDays[index - 1]);
    const current = parseDate(sortedActiveDays[index]);
    const difference = Math.round(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (difference === 1) {
      running += 1;
    } else {
      running = 1;
    }

    longest = Math.max(longest, running);
  }

  let current = 1;

  for (let index = sortedActiveDays.length - 1; index > 0; index -= 1) {
    const latest = parseDate(sortedActiveDays[index]);
    const previous = parseDate(sortedActiveDays[index - 1]);
    const difference = Math.round(
      (latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (difference === 1) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    current,
    longest
  };
}

function buildTargetStreaks(weeks: HabitWeekSummary[]) {
  let longest = 0;
  let running = 0;

  for (const week of weeks) {
    if (week.meetsTarget) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let current = 0;

  for (let index = weeks.length - 1; index >= 0; index -= 1) {
    if (weeks[index].meetsTarget) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    current,
    longest
  };
}

function buildStatusCopy(
  currentWeek: HabitWeekSummary,
  currentWeekTargetStreak: number,
  daysSinceLastWorkout: number | null,
  target: number
) {
  if (daysSinceLastWorkout === null) {
    return {
      label: "Start the rhythm",
      detail: `Aim for ${target} active days this week. The streak view starts filling in as soon as the first session is logged.`,
      tone: "neutral" as const,
      encouragement: "A short first workout is enough to start momentum."
    };
  }

  if (currentWeek.meetsTarget) {
    return {
      label:
        currentWeekTargetStreak >= 2 ? "Consistency is holding" : currentWeek.statusLabel,
      detail:
        currentWeekTargetStreak >= 2
          ? `You are on a ${currentWeekTargetStreak}-week run of hitting your baseline, and this week is already over the line.`
          : currentWeek.statusDetail,
      tone: "positive" as const,
      encouragement:
        daysSinceLastWorkout <= 2
          ? "Keep the next session simple and protect the rhythm you already built."
          : "You already cleared the baseline this week, so one clean return session will keep the pattern healthy."
    };
  }

  if (currentWeek.daysToTarget === 1) {
    return {
      label: "One session away",
      detail: currentWeek.statusDetail,
      tone: "neutral" as const,
      encouragement: "A short lift or conditioning session is enough to finish the week strong."
    };
  }

  if (currentWeek.tone === "attention") {
    return {
      label: currentWeek.statusLabel,
      detail: currentWeek.statusDetail,
      tone: "attention" as const,
      encouragement:
        daysSinceLastWorkout >= 4
          ? "Momentum comes back faster when you restart with an easy session instead of waiting for a perfect one."
          : "Protect the remaining days in the week and keep the next workout low-friction."
    };
  }

  return {
    label: currentWeek.statusLabel,
    detail: currentWeek.statusDetail,
    tone: "neutral" as const,
    encouragement: "You are still within reach of the weekly target, so consistency matters more than intensity."
  };
}

export function buildHabitSnapshot(
  workouts: Workout[],
  referenceDate = new Date()
): HabitSnapshot {
  const today = startOfDay(referenceDate);
  const groupedDays = buildDayAggregates(workouts);
  const activeDayKeys = [...groupedDays.keys()].sort((left, right) =>
    left.localeCompare(right)
  );
  const currentWeekStart = getWeekStart(today);
  const earliestWeekStart =
    activeDayKeys.length > 0 ? getWeekStart(activeDayKeys[0]) : addDays(currentWeekStart, -35);
  const weeksAscending: HabitWeekSummary[] = [];

  for (
    let cursor = new Date(earliestWeekStart);
    cursor <= currentWeekStart;
    cursor = addDays(cursor, 7)
  ) {
    weeksAscending.push(
      buildWeekSummary(cursor, groupedDays, today, weeklyHabitTarget)
    );
  }

  const currentWeek = weeksAscending[weeksAscending.length - 1];
  const recentWeeks = [...weeksAscending].slice(-6).reverse();
  const dayStreaks = buildActiveDayStreaks(activeDayKeys);
  const targetStreaks = buildTargetStreaks(weeksAscending);
  const latestWorkoutDate = activeDayKeys[activeDayKeys.length - 1];
  const daysSinceLastWorkout = latestWorkoutDate
    ? Math.max(
        0,
        Math.floor(
          (today.getTime() - parseDate(latestWorkoutDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;
  const status = buildStatusCopy(
    currentWeek,
    targetStreaks.current,
    daysSinceLastWorkout,
    weeklyHabitTarget
  );

  return {
    weeklyTarget: weeklyHabitTarget,
    currentWeek,
    recentWeeks,
    recentFortnight: buildRecentFortnight(groupedDays, today),
    currentWeekTargetStreak: targetStreaks.current,
    longestWeekTargetStreak: targetStreaks.longest,
    currentActiveDayStreak: dayStreaks.current,
    longestActiveDayStreak: dayStreaks.longest,
    activeDaysLast7: countActiveDaysWithin(groupedDays, today, 7),
    activeDaysLast30: countActiveDaysWithin(groupedDays, today, 30),
    daysSinceLastWorkout,
    statusLabel: status.label,
    statusDetail: status.detail,
    tone: status.tone,
    encouragement: status.encouragement
  };
}
