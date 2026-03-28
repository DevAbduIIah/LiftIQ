import type {
  DashboardHighlight,
  DashboardPanelItem,
  SummaryMetric
} from "../types/dashboard";

export const summaryMetrics: SummaryMetric[] = [
  {
    label: "Weekly sessions",
    value: "0",
    change: "Start your first training block",
    tone: "neutral"
  },
  {
    label: "Tracked volume",
    value: "0 kg",
    change: "Volume updates after logging workouts",
    tone: "neutral"
  },
  {
    label: "Consistency score",
    value: "Pending",
    change: "Unlock after 7 active days",
    tone: "attention"
  },
  {
    label: "Nutrition adherence",
    value: "N/A",
    change: "Connect meals to compare intake vs target",
    tone: "neutral"
  }
];

export const recentActivity: DashboardPanelItem[] = [
  {
    title: "No workouts logged yet",
    description: "Your most recent lifts, notes, and training days will appear here.",
    meta: "Next step: add your first session"
  },
  {
    title: "Progress snapshots are warming up",
    description: "LiftIQ will surface momentum, plateaus, and personal bests once data starts flowing.",
    meta: "Charts arrive in Phase 4"
  }
];

export const dashboardHighlights: DashboardHighlight[] = [
  {
    eyebrow: "Coaching lane",
    title: "Smart suggestions, grounded in your logs",
    description: "Later phases will turn workout history into practical next-step guidance without gimmicks."
  },
  {
    eyebrow: "Nutrition lane",
    title: "Daily fuel, tracked alongside training",
    description: "Keep meals, macros, and workout consistency in one place instead of juggling separate tools."
  }
];

export const upcomingMilestones: DashboardPanelItem[] = [
  {
    title: "Workout tracker",
    description: "Fast logging flow with edit and delete support.",
    meta: "Phase 2"
  },
  {
    title: "Analytics",
    description: "Readable progress charts for strength, volume, and consistency.",
    meta: "Phase 4"
  },
  {
    title: "Coaching insights",
    description: "Rule-based suggestions built from your actual training behavior.",
    meta: "Phase 5"
  }
];
