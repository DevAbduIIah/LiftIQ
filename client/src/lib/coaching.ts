import type { DashboardPanelItem, SummaryMetric } from "../types/dashboard";
import {
  exerciseCategories,
  type ExerciseCategory,
  type Workout
} from "../types/workout";

type InsightTone = SummaryMetric["tone"];

export interface CoachingInsight {
  id: string;
  kind: "overload" | "stagnation" | "coverage" | "consistency" | "recovery";
  label: string;
  title: string;
  description: string;
  action: string;
  tone: InsightTone;
}

export interface CoachingReadiness {
  label: string;
  detail: string;
  tone: InsightTone;
}

export interface CategoryReminder {
  category: ExerciseCategory;
  daysSince: number;
  lastTrained: string;
  sessionCount: number;
}

export interface CoachingSnapshot {
  insights: CoachingInsight[];
  readiness: CoachingReadiness;
  summaryMetrics: SummaryMetric[];
  recentActivity: DashboardPanelItem[];
  trainedCategories: ExerciseCategory[];
  trackedCategories: ExerciseCategory[];
  missedCategories: CategoryReminder[];
  weeklyActiveDays: number;
  weeklyEntries: number;
  monthlyVolume: number;
}

interface ScoredInsight extends CoachingInsight {
  priority: number;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function sortNewestFirst(workouts: Workout[]) {
  return [...workouts].sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function getDaysSince(value: string, reference = new Date()) {
  const current = new Date(reference);
  current.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((current.getTime() - parseDate(value).getTime()) / (1000 * 60 * 60 * 24))
  );
}

function getVolume(workouts: Workout[]) {
  return workouts.reduce(
    (sum, workout) => sum + workout.sets * workout.reps * workout.weight,
    0
  );
}

function getWorkoutsWithinDays(workouts: Workout[], days: number) {
  return workouts.filter((workout) => getDaysSince(workout.date) <= days - 1);
}

function getUniqueActiveDays(workouts: Workout[]) {
  return new Set(workouts.map((workout) => workout.date)).size;
}

function formatWorkoutDate(value: string) {
  return parseDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function getWeekStart(value: string) {
  const date = parseDate(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function getCategoryVolume(workouts: Workout[]) {
  const grouped = new Map<ExerciseCategory, number>();

  for (const workout of workouts) {
    grouped.set(
      workout.category,
      (grouped.get(workout.category) ?? 0) + workout.sets * workout.reps * workout.weight
    );
  }

  return grouped;
}

function buildRecentActivity(workouts: Workout[]): DashboardPanelItem[] {
  if (workouts.length === 0) {
    return [
      {
        title: "No workouts logged yet",
        description: "Your most recent lifts, notes, and training days will appear here.",
        meta: "Next step: add your first session"
      },
      {
        title: "Coaching unlocks from real history",
        description: "LiftIQ will start flagging overload chances, consistency trends, and recovery cues once data starts flowing.",
        meta: "Phase 5 ready"
      }
    ];
  }

  return workouts.slice(0, 4).map((workout) => ({
    title: workout.exerciseName,
    description: `${workout.category} | ${workout.sets} x ${workout.reps} x ${workout.weight} kg`,
    meta: formatWorkoutDate(workout.date)
  }));
}

function buildReadiness(workouts: Workout[]): CoachingReadiness {
  if (workouts.length === 0) {
    return {
      label: "Awaiting data",
      detail: "Log a few sessions to unlock timing and recovery guidance.",
      tone: "neutral"
    };
  }

  const latestWorkout = workouts[0];
  const daysSinceLastWorkout = getDaysSince(latestWorkout.date);
  const latestDayWorkouts = workouts.filter(
    (workout) => workout.date === latestWorkout.date
  );
  const recentFourteenDays = getWorkoutsWithinDays(workouts, 14);
  const recentActiveDays = Math.max(getUniqueActiveDays(recentFourteenDays), 1);
  const averageDailyVolume = getVolume(recentFourteenDays) / recentActiveDays;
  const latestDayVolume = getVolume(latestDayWorkouts);

  if (daysSinceLastWorkout <= 1 && latestDayVolume >= averageDailyVolume * 1.1) {
    return {
      label: "Recovery focus",
      detail: `Last session was ${daysSinceLastWorkout} day(s) ago and carried ${Math.round(latestDayVolume).toLocaleString()} kg of volume.`,
      tone: "attention"
    };
  }

  if (daysSinceLastWorkout <= 1) {
    return {
      label: "Rotate today",
      detail: "You trained very recently, so a lighter day or a different muscle group is the smarter call.",
      tone: "neutral"
    };
  }

  if (daysSinceLastWorkout <= 3) {
    return {
      label: "Ready to push",
      detail: `It has been ${daysSinceLastWorkout} day(s) since your last workout, which is usually a solid window for another main session.`,
      tone: "positive"
    };
  }

  return {
    label: "Ease back in",
    detail: `It has been ${daysSinceLastWorkout} day(s) since your last workout, so a shorter return session will help momentum more than waiting longer.`,
    tone: "attention"
  };
}

function buildOverloadInsight(workouts: Workout[]): ScoredInsight | null {
  const grouped = new Map<string, Workout[]>();

  for (const workout of workouts) {
    const key = `${workout.category}:${workout.exerciseName}`;
    const current = grouped.get(key) ?? [];
    current.push(workout);
    grouped.set(key, current);
  }

  let bestCandidate: ScoredInsight | null = null;

  for (const [key, entries] of grouped.entries()) {
    if (entries.length < 2) {
      continue;
    }

    const ordered = [...entries].sort((left, right) => {
      if (left.date !== right.date) {
        return right.date.localeCompare(left.date);
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });

    const latest = ordered[0];
    const previous = ordered.slice(1);
    const previousBest = previous.reduce(
      (max, workout) => Math.max(max, workout.weight),
      0
    );
    const gapToBest = previousBest - latest.weight;
    const daysSinceLatest = getDaysSince(latest.date);

    if (latest.weight > previousBest) {
      const improvement = latest.weight - previousBest;
      const candidate: ScoredInsight = {
        id: `overload:${key}`,
        kind: "overload",
        label: "Progressive overload",
        title: `${latest.exerciseName} is moving up`,
        description: `Your latest ${latest.exerciseName} entry hit ${latest.weight.toLocaleString()} kg, beating the previous best by ${improvement.toLocaleString()} kg.`,
        action: "Repeat that load cleanly or add a rep next time to make the gain stick.",
        tone: "positive",
        priority: 92 + Math.min(improvement, 5) - daysSinceLatest
      };

      if (!bestCandidate || candidate.priority > bestCandidate.priority) {
        bestCandidate = candidate;
      }

      continue;
    }

    if (gapToBest < 0 || gapToBest > 2.5 || daysSinceLatest > 21) {
      continue;
    }

    const candidate: ScoredInsight = {
      id: `overload:${key}`,
      kind: "overload",
      label: "Progressive overload",
      title: `${latest.exerciseName} is close to a breakthrough`,
      description: `Your latest ${latest.exerciseName} log is only ${gapToBest.toLocaleString()} kg off your best and still sits inside your recent training rhythm.`,
      action: `If form felt sharp, nudge the next session up by ${Math.max(
        1,
        Math.min(gapToBest, 2.5)
      ).toLocaleString()} kg or add one extra rep.`,
      tone: "positive",
      priority: 78 - gapToBest * 8 - daysSinceLatest
    };

    if (!bestCandidate || candidate.priority > bestCandidate.priority) {
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

function buildStagnationInsight(workouts: Workout[]): ScoredInsight | null {
  const recentWindow = getWorkoutsWithinDays(workouts, 42);
  const grouped = new Map<string, Workout[]>();

  for (const workout of recentWindow) {
    const key = `${workout.category}:${workout.exerciseName}`;
    const current = grouped.get(key) ?? [];
    current.push(workout);
    grouped.set(key, current);
  }

  let bestCandidate: ScoredInsight | null = null;

  for (const [key, entries] of grouped.entries()) {
    if (entries.length < 3) {
      continue;
    }

    const chronological = [...entries].sort((left, right) => {
      if (left.date !== right.date) {
        return left.date.localeCompare(right.date);
      }

      return left.updatedAt.localeCompare(right.updatedAt);
    });

    const first = chronological[0];
    const latest = chronological[chronological.length - 1];
    const spanDays = getDaysSince(first.date) - getDaysSince(latest.date);
    const latestThree = chronological.slice(-3);
    const weights = latestThree.map((entry) => entry.weight);
    const weightSpread = Math.max(...weights) - Math.min(...weights);
    const bestBeforeLatest = chronological
      .slice(0, -1)
      .reduce((max, entry) => Math.max(max, entry.weight), 0);

    if (spanDays < 14 || weightSpread > 2.5 || latest.weight > bestBeforeLatest) {
      continue;
    }

    const candidate: ScoredInsight = {
      id: `stagnation:${key}`,
      kind: "stagnation",
      label: "Plateau watch",
      title: `${latest.exerciseName} looks stuck`,
      description: `${latest.exerciseName} has hovered between ${Math.min(
        ...weights
      ).toLocaleString()} and ${Math.max(...weights).toLocaleString()} kg across ${
        latestThree.length
      } recent logs over ${spanDays} days.`,
      action: "Change one lever on the next round: add a rep, trim fatigue with a lighter day, or add a back-off set before chasing load again.",
      tone: "attention",
      priority: 80 + latestThree.length * 2 + spanDays / 7
    };

    if (!bestCandidate || candidate.priority > bestCandidate.priority) {
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

function buildCoverageInsight(
  workouts: Workout[],
  trackedCategories: ExerciseCategory[],
  recentCategories: ExerciseCategory[],
  missedCategories: CategoryReminder[]
): ScoredInsight | null {
  const lastThirtyDays = getWorkoutsWithinDays(workouts, 30);

  if (lastThirtyDays.length < 4 || trackedCategories.length === 0) {
    return null;
  }

  if (missedCategories.length > 0 && recentCategories.length > 0) {
    const overdue = missedCategories.slice(0, 2);
    const detail = overdue
      .map(
        (entry) =>
          `${entry.category} (${entry.daysSince} day${entry.daysSince === 1 ? "" : "s"})`
      )
      .join(" and ");

    return {
      id: "coverage:reminder",
      kind: "coverage",
      label: "Muscle coverage",
      title: "A muscle group is falling behind",
      description: `You have kept training recently, but ${detail} has not shown up in the log.`,
      action: "Steer the next session toward the oldest gap so your split stays balanced.",
      tone: "attention",
      priority: 72 + overdue[0].daysSince
    };
  }

  if (recentCategories.length >= Math.min(4, trackedCategories.length)) {
    return {
      id: "coverage:balanced",
      kind: "coverage",
      label: "Muscle coverage",
      title: "Coverage looks balanced",
      description: `You touched ${recentCategories.length} tracked muscle groups in the last 14 days, which keeps the program from drifting too hard into one lane.`,
      action: "Keep rotating categories instead of repeating only your easiest wins.",
      tone: "positive",
      priority: 62 + recentCategories.length
    };
  }

  return null;
}

function buildConsistencyInsight(workouts: Workout[]): ScoredInsight | null {
  if (workouts.length === 0) {
    return null;
  }

  const lastTwentyEightDays = getWorkoutsWithinDays(workouts, 28);
  const activeWeeks = new Set(lastTwentyEightDays.map((workout) => getWeekStart(workout.date)))
    .size;
  const activeDays = getUniqueActiveDays(lastTwentyEightDays);
  const sessionsPerWeek = activeDays / 4;
  const daysSinceLastWorkout = getDaysSince(workouts[0].date);

  if (daysSinceLastWorkout >= 5) {
    return {
      id: "consistency:return",
      kind: "consistency",
      label: "Consistency",
      title: "Momentum needs a reset",
      description: `It has been ${daysSinceLastWorkout} day(s) since your last session, which is long enough for consistency to start slipping.`,
      action: "Come back with a short session instead of waiting for a perfect full workout.",
      tone: "attention",
      priority: 88 + daysSinceLastWorkout
    };
  }

  if (activeWeeks >= 3 && sessionsPerWeek >= 2) {
    return {
      id: "consistency:stable",
      kind: "consistency",
      label: "Consistency",
      title: "Your routine is holding together",
      description: `You have logged training in ${activeWeeks} of the last 4 weeks at roughly ${sessionsPerWeek.toFixed(
        1
      )} active days per week.`,
      action: "Protect that rhythm first. Regular sessions will move progress faster than chasing perfect peak days.",
      tone: "positive",
      priority: 74 + activeWeeks * 3
    };
  }

  return {
    id: "consistency:build",
    kind: "consistency",
    label: "Consistency",
    title: "A steadier cadence will help",
    description: `The last 4 weeks show ${activeDays} active day(s), which is enough to learn from but not yet enough for a strong rhythm.`,
    action: "Aim for two anchored training days each week before trying to add more complexity.",
    tone: "neutral",
    priority: 58 + activeDays
  };
}

function buildRecoveryInsight(workouts: Workout[]): ScoredInsight | null {
  if (workouts.length === 0) {
    return null;
  }

  const latestWorkout = workouts[0];
  const daysSinceLastWorkout = getDaysSince(latestWorkout.date);

  if (daysSinceLastWorkout > 1) {
    return null;
  }

  const latestDayWorkouts = workouts.filter(
    (workout) => workout.date === latestWorkout.date
  );
  const latestCategories = [...new Set(latestDayWorkouts.map((workout) => workout.category))];
  const priorTwoDays = workouts.filter((workout) => {
    const difference =
      (parseDate(latestWorkout.date).getTime() - parseDate(workout.date).getTime()) /
      (1000 * 60 * 60 * 24);

    return difference > 0 && difference <= 2;
  });
  const repeatedCategories = latestCategories.filter((category) =>
    priorTwoDays.some((workout) => workout.category === category)
  );

  if (repeatedCategories.length === 0) {
    return null;
  }

  return {
    id: "recovery:repeat",
    kind: "recovery",
    label: "Recovery",
    title: `${repeatedCategories[0]} may need breathing room`,
    description: `You hit ${repeatedCategories[0]} again inside a 48-hour window, which can make fatigue harder to spot before performance drops.`,
    action: "Use the next session for another category, lighter technique work, or a lower-fatigue day.",
    tone: "attention",
    priority: 91 + repeatedCategories.length
  };
}

function buildSummaryMetrics(
  workouts: Workout[],
  readiness: CoachingReadiness,
  trackedCategories: ExerciseCategory[],
  trainedCategories: ExerciseCategory[],
  missedCategories: CategoryReminder[]
): SummaryMetric[] {
  const lastSevenDays = getWorkoutsWithinDays(workouts, 7);
  const lastThirtyDays = getWorkoutsWithinDays(workouts, 30);
  const weeklyActiveDays = getUniqueActiveDays(lastSevenDays);
  const weeklyEntries = lastSevenDays.length;
  const monthlyVolume = getVolume(lastThirtyDays);
  const categoryVolume = getCategoryVolume(lastThirtyDays);
  const strongestCategory = [...categoryVolume.entries()].sort(
    (left, right) => right[1] - left[1]
  )[0]?.[0];
  const coverageTone: InsightTone =
    trackedCategories.length > 0 && trainedCategories.length === trackedCategories.length
      ? "positive"
      : missedCategories.length > 0
        ? "attention"
        : "neutral";

  return [
    {
      label: "Weekly sessions",
      value: weeklyActiveDays.toLocaleString(),
      change:
        weeklyEntries > 0
          ? `${weeklyEntries} logged lift${weeklyEntries === 1 ? "" : "s"} across the last 7 days`
          : "No sessions logged in the last 7 days",
      tone: weeklyActiveDays >= 2 ? "positive" : weeklyActiveDays === 1 ? "neutral" : "attention"
    },
    {
      label: "30-day volume",
      value: `${Math.round(monthlyVolume).toLocaleString()} kg`,
      change: strongestCategory
        ? `${strongestCategory} carried the most workload this month`
        : "Volume updates as soon as workouts are logged",
      tone: monthlyVolume > 0 ? "positive" : "neutral"
    },
    {
      label: "Coverage",
      value: `${trainedCategories.length}/${Math.max(trackedCategories.length, 1)} groups`,
      change:
        missedCategories.length > 0
          ? `${missedCategories[0].category} last showed up ${missedCategories[0].daysSince} day(s) ago`
          : trackedCategories.length > 0
            ? "All tracked groups have recent exposure"
            : "Coverage builds from your logged categories",
      tone: coverageTone
    },
    {
      label: "Readiness",
      value: readiness.label,
      change: readiness.detail,
      tone: readiness.tone
    }
  ];
}

export function buildCoachingSnapshot(workouts: Workout[]): CoachingSnapshot {
  const sortedWorkouts = sortNewestFirst(workouts);
  const trackedCategories = exerciseCategories.filter((category) =>
    sortedWorkouts.some((workout) => workout.category === category)
  );
  const recentCategorySet = new Set(
    getWorkoutsWithinDays(sortedWorkouts, 14).map((workout) => workout.category)
  );
  const trainedCategories = [...recentCategorySet];
  const missedCategories = trackedCategories
    .filter((category) => !recentCategorySet.has(category))
    .map((category) => {
      const categoryWorkouts = sortedWorkouts.filter((workout) => workout.category === category);

      return {
        category,
        daysSince: getDaysSince(categoryWorkouts[0].date),
        lastTrained: categoryWorkouts[0].date,
        sessionCount: categoryWorkouts.length
      };
    })
    .sort((left, right) => right.daysSince - left.daysSince);
  const readiness = buildReadiness(sortedWorkouts);
  const insights = [
    buildRecoveryInsight(sortedWorkouts),
    buildOverloadInsight(sortedWorkouts),
    buildStagnationInsight(sortedWorkouts),
    buildCoverageInsight(
      sortedWorkouts,
      trackedCategories,
      trainedCategories,
      missedCategories
    ),
    buildConsistencyInsight(sortedWorkouts)
  ]
    .filter((insight): insight is ScoredInsight => insight !== null)
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 4)
    .map(({ priority: _priority, ...insight }) => insight);
  const lastSevenDays = getWorkoutsWithinDays(sortedWorkouts, 7);
  const lastThirtyDays = getWorkoutsWithinDays(sortedWorkouts, 30);

  return {
    insights,
    readiness,
    summaryMetrics: buildSummaryMetrics(
      sortedWorkouts,
      readiness,
      trackedCategories,
      trainedCategories,
      missedCategories
    ),
    recentActivity: buildRecentActivity(sortedWorkouts),
    trainedCategories,
    trackedCategories,
    missedCategories,
    weeklyActiveDays: getUniqueActiveDays(lastSevenDays),
    weeklyEntries: lastSevenDays.length,
    monthlyVolume: getVolume(lastThirtyDays)
  };
}
