import type { Workout } from "../types/workout";

export type TimeRange = "7d" | "30d" | "90d" | "all";

export interface TrendPoint {
  date: string;
  label: string;
  value: number;
}

export interface PersonalRecordEvent {
  id: string;
  exerciseName: string;
  category: Workout["category"];
  date: string;
  weight: number;
  improvement: number;
}

export interface StrongestExercise {
  exerciseName: string;
  category: Workout["category"];
  maxWeight: number;
  totalVolume: number;
  sessions: number;
}

export interface ConsistencyMetrics {
  activeDays: number;
  totalDays: number;
  sessionsPerWeek: number;
  activeWeeks: number;
  totalWeeks: number;
  currentWeekStreak: number;
  longestWeekStreak: number;
  daysSinceLastWorkout: number | null;
}

export interface ComparisonMetric {
  label: string;
  current: number;
  previous: number;
  delta: number | null;
}

export interface ProgressAnalytics {
  filteredWorkouts: Workout[];
  totalVolume: number;
  heaviestWeight: number;
  activeDays: number;
  weightTrend: TrendPoint[];
  volumeTrend: TrendPoint[];
  frequencyTrend: TrendPoint[];
  personalRecords: PersonalRecordEvent[];
  strongestExercises: StrongestExercise[];
  consistency: ConsistencyMetrics;
  recentProgress: ComparisonMetric[];
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatLabel(value: string) {
  return parseDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function getStartDate(range: TimeRange) {
  if (range === "all") {
    return null;
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function filterWorkoutsByRange(workouts: Workout[], range: TimeRange) {
  const startDate = getStartDate(range);

  if (!startDate) {
    return [...workouts];
  }

  return workouts.filter((workout) => parseDate(workout.date) >= startDate);
}

function groupByDay(workouts: Workout[]) {
  const grouped = new Map<
    string,
    {
      maxWeight: number;
      totalVolume: number;
      workoutCount: number;
    }
  >();

  for (const workout of workouts) {
    const current = grouped.get(workout.date) ?? {
      maxWeight: 0,
      totalVolume: 0,
      workoutCount: 0
    };

    current.maxWeight = Math.max(current.maxWeight, workout.weight);
    current.totalVolume += workout.sets * workout.reps * workout.weight;
    current.workoutCount += 1;

    grouped.set(workout.date, current);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, values]) => ({
      date,
      label: formatLabel(date),
      ...values
    }));
}

function getWeekStart(value: string) {
  const date = parseDate(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function getWeekDifference(left: string, right: string) {
  const leftDate = parseDate(left);
  const rightDate = parseDate(right);
  const milliseconds = rightDate.getTime() - leftDate.getTime();
  return Math.round(milliseconds / (1000 * 60 * 60 * 24 * 7));
}

function buildConsistencyMetrics(
  filteredWorkouts: Workout[],
  allWorkouts: Workout[],
  range: TimeRange
): ConsistencyMetrics {
  const uniqueDays = [...new Set(filteredWorkouts.map((workout) => workout.date))].sort();
  const uniqueWeeks = [...new Set(filteredWorkouts.map((workout) => getWeekStart(workout.date)))].sort();
  const totalDays =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : Math.max(uniqueDays.length, 1);
  const totalWeeks =
    range === "7d" ? 1 : range === "30d" ? 5 : range === "90d" ? 13 : Math.max(uniqueWeeks.length, 1);

  let longestWeekStreak = 0;
  let currentWeekStreak = 0;

  if (uniqueWeeks.length > 0) {
    let running = 1;
    longestWeekStreak = 1;

    for (let index = 1; index < uniqueWeeks.length; index += 1) {
      if (getWeekDifference(uniqueWeeks[index - 1], uniqueWeeks[index]) === 1) {
        running += 1;
      } else {
        running = 1;
      }

      longestWeekStreak = Math.max(longestWeekStreak, running);
    }

    currentWeekStreak = 1;

    for (let index = uniqueWeeks.length - 1; index > 0; index -= 1) {
      if (getWeekDifference(uniqueWeeks[index - 1], uniqueWeeks[index]) === 1) {
        currentWeekStreak += 1;
      } else {
        break;
      }
    }
  }

  const latestWorkout = allWorkouts[0];
  const daysSinceLastWorkout = latestWorkout
    ? Math.max(
        0,
        Math.floor(
          (new Date().setHours(0, 0, 0, 0) - parseDate(latestWorkout.date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return {
    activeDays: uniqueDays.length,
    totalDays,
    sessionsPerWeek: Number((filteredWorkouts.length / totalWeeks).toFixed(1)),
    activeWeeks: uniqueWeeks.length,
    totalWeeks,
    currentWeekStreak,
    longestWeekStreak,
    daysSinceLastWorkout
  };
}

function buildPersonalRecords(
  allWorkouts: Workout[],
  filteredWorkouts: Workout[]
): PersonalRecordEvent[] {
  const chronological = [...allWorkouts].sort((left, right) => {
    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }

    return left.updatedAt.localeCompare(right.updatedAt);
  });

  const bestByExercise = new Map<string, number>();
  const filteredIds = new Set(filteredWorkouts.map((workout) => workout.id));
  const events: PersonalRecordEvent[] = [];

  for (const workout of chronological) {
    const key = `${workout.category}:${workout.exerciseName}`;
    const previousBest = bestByExercise.get(key);

    if (
      previousBest !== undefined &&
      workout.weight > previousBest &&
      filteredIds.has(workout.id)
    ) {
      events.push({
        id: workout.id,
        exerciseName: workout.exerciseName,
        category: workout.category,
        date: workout.date,
        weight: workout.weight,
        improvement: workout.weight - previousBest
      });
    }

    if (previousBest === undefined || workout.weight > previousBest) {
      bestByExercise.set(key, workout.weight);
    }
  }

  return events
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 6);
}

function buildStrongestExercises(filteredWorkouts: Workout[]) {
  const grouped = new Map<string, StrongestExercise>();

  for (const workout of filteredWorkouts) {
    const key = `${workout.category}:${workout.exerciseName}`;
    const current = grouped.get(key) ?? {
      exerciseName: workout.exerciseName,
      category: workout.category,
      maxWeight: 0,
      totalVolume: 0,
      sessions: 0
    };

    current.maxWeight = Math.max(current.maxWeight, workout.weight);
    current.totalVolume += workout.sets * workout.reps * workout.weight;
    current.sessions += 1;
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .sort((left, right) => {
      if (left.maxWeight !== right.maxWeight) {
        return right.maxWeight - left.maxWeight;
      }

      return right.totalVolume - left.totalVolume;
    })
    .slice(0, 5);
}

function compareWindows(
  workouts: Workout[],
  range: TimeRange
): ComparisonMetric[] {
  const referenceDays = range === "7d" ? 7 : range === "30d" ? 30 : 30;
  const endCurrent = new Date();
  endCurrent.setHours(23, 59, 59, 999);
  const startCurrent = new Date(endCurrent);
  startCurrent.setDate(endCurrent.getDate() - (referenceDays - 1));
  startCurrent.setHours(0, 0, 0, 0);

  const endPrevious = new Date(startCurrent);
  endPrevious.setDate(startCurrent.getDate() - 1);
  endPrevious.setHours(23, 59, 59, 999);
  const startPrevious = new Date(endPrevious);
  startPrevious.setDate(endPrevious.getDate() - (referenceDays - 1));
  startPrevious.setHours(0, 0, 0, 0);

  const currentWindow = workouts.filter((workout) => {
    const date = parseDate(workout.date);
    return date >= startCurrent && date <= endCurrent;
  });

  const previousWindow = workouts.filter((workout) => {
    const date = parseDate(workout.date);
    return date >= startPrevious && date <= endPrevious;
  });

  const currentVolume = currentWindow.reduce(
    (sum, workout) => sum + workout.sets * workout.reps * workout.weight,
    0
  );
  const previousVolume = previousWindow.reduce(
    (sum, workout) => sum + workout.sets * workout.reps * workout.weight,
    0
  );
  const currentHeaviest = currentWindow.reduce(
    (max, workout) => Math.max(max, workout.weight),
    0
  );
  const previousHeaviest = previousWindow.reduce(
    (max, workout) => Math.max(max, workout.weight),
    0
  );
  const currentDays = new Set(currentWindow.map((workout) => workout.date)).size;
  const previousDays = new Set(previousWindow.map((workout) => workout.date)).size;

  return [
    {
      label: "Volume",
      current: currentVolume,
      previous: previousVolume,
      delta: currentVolume - previousVolume
    },
    {
      label: "Heaviest lift",
      current: currentHeaviest,
      previous: previousHeaviest,
      delta: currentHeaviest - previousHeaviest
    },
    {
      label: "Active days",
      current: currentDays,
      previous: previousDays,
      delta: currentDays - previousDays
    }
  ];
}

export function buildProgressAnalytics(
  workouts: Workout[],
  range: TimeRange
): ProgressAnalytics {
  const filteredWorkouts = filterWorkoutsByRange(workouts, range);
  const groupedByDay = groupByDay(filteredWorkouts);

  return {
    filteredWorkouts,
    totalVolume: filteredWorkouts.reduce(
      (sum, workout) => sum + workout.sets * workout.reps * workout.weight,
      0
    ),
    heaviestWeight: filteredWorkouts.reduce(
      (max, workout) => Math.max(max, workout.weight),
      0
    ),
    activeDays: new Set(filteredWorkouts.map((workout) => workout.date)).size,
    weightTrend: groupedByDay.map((entry) => ({
      date: entry.date,
      label: entry.label,
      value: entry.maxWeight
    })),
    volumeTrend: groupedByDay.map((entry) => ({
      date: entry.date,
      label: entry.label,
      value: entry.totalVolume
    })),
    frequencyTrend: groupedByDay.map((entry) => ({
      date: entry.date,
      label: entry.label,
      value: entry.workoutCount
    })),
    personalRecords: buildPersonalRecords(workouts, filteredWorkouts),
    strongestExercises: buildStrongestExercises(filteredWorkouts),
    consistency: buildConsistencyMetrics(filteredWorkouts, workouts, range),
    recentProgress: compareWindows(workouts, range)
  };
}
