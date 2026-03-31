import { Activity, CalendarRange, HeartPulse, Trophy } from "lucide-react";
import { HabitWeekStrip } from "../components/ui/HabitWeekStrip";
import { CoachingInsightList } from "../components/ui/CoachingInsightList";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { useHealthCheck } from "../hooks/useHealthCheck";
import { useWorkouts } from "../hooks/useWorkouts";
import { buildCoachingSnapshot } from "../lib/coaching";
import { buildHabitSnapshot } from "../lib/habits";
import { buildProgressAnalytics } from "../lib/progress";
import { routes } from "../routes";

export function DashboardPage() {
  const { data, error, isLoading } = useHealthCheck();
  const {
    workouts,
    isLoading: workoutsLoading,
    error: workoutsError,
    reload
  } = useWorkouts();
  const coaching = buildCoachingSnapshot(workouts);
  const habits = buildHabitSnapshot(workouts);
  const progressSnapshot = buildProgressAnalytics(workouts, "30d");
  const strongestExercise = progressSnapshot.strongestExercises[0];
  const latestRecord = progressSnapshot.personalRecords[0];
  const dashboardMetrics = [
    {
      label: "This week",
      value: `${habits.currentWeek.activeDays}/${habits.weeklyTarget} days`,
      change: habits.statusDetail,
      tone: habits.tone
    },
    {
      label: "Week streak",
      value: `${habits.currentWeekTargetStreak} wk`,
      change:
        habits.currentWeekTargetStreak > 0
          ? `${habits.currentWeekTargetStreak} straight week(s) at your consistency baseline`
          : `Hit ${habits.weeklyTarget} active days to start a week streak`,
      tone:
        habits.currentWeekTargetStreak > 0
          ? "positive"
          : habits.currentWeek.activeDays > 0
            ? "neutral"
            : "attention"
    },
    {
      label: "30-day volume",
      value: `${Math.round(coaching.monthlyVolume).toLocaleString()} kg`,
      change:
        habits.activeDaysLast30 > 0
          ? `${habits.activeDaysLast30} active day(s) logged across the last 30 days`
          : "Volume builds as soon as workouts land in the log",
      tone: coaching.monthlyVolume > 0 ? "positive" : "neutral"
    },
    {
      label: "Readiness",
      value: coaching.readiness.label,
      change: coaching.readiness.detail,
      tone: coaching.readiness.tone
    }
  ] as const;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Command center"
        title="Training guidance built from your real log"
        description="LiftIQ now turns workout history into practical next-step coaching, while keeping the dashboard fast to scan and grounded in what you actually tracked."
        actions={<ButtonLink to={routes.workouts}>Log workout</ButtonLink>}
      />

      <section className="stats-grid">
        {dashboardMetrics.map((metric) => (
          <StatCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="dashboard-grid">
        <Card
          title="Coaching guidance"
          subtitle="Rule-based suggestions from your workout history, not vague hype."
          className="hero-card"
        >
          {workoutsLoading ? (
            <div className="loading-state">
              <HeartPulse size={18} className="spin" />
              <p>Reading recent training patterns...</p>
            </div>
          ) : workoutsError ? (
            <div className="alert-banner error">
              <p>{workoutsError}</p>
              <div className="form-actions">
                <button
                  type="button"
                  className="button-link secondary"
                  onClick={() => void reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : workouts.length === 0 ? (
            <EmptyState
              title="Your first workouts unlock coaching"
              description="Log a few sessions and LiftIQ will start surfacing overload chances, consistency signals, recovery cues, and missed-category reminders here."
              actions={
                <>
                  <ButtonLink to={routes.workouts}>Start logging</ButtonLink>
                  <ButtonLink to={routes.progress} variant="secondary">
                    Preview progress
                  </ButtonLink>
                </>
              }
            />
          ) : (
            <div className="compact-stack">
              <div className="coach-summary">
                <span className={`status-pill ${coaching.readiness.tone}`}>
                  {coaching.readiness.label}
                </span>
                <p>{coaching.readiness.detail}</p>
              </div>

              <CoachingInsightList
                insights={coaching.insights}
                emptyTitle="Training is collecting signal."
                emptyDescription="Keep adding sessions and LiftIQ will turn those patterns into clearer coaching prompts."
              />
            </div>
          )}
        </Card>

        <Card
          title="Platform health"
          subtitle="Backend connectivity stays visible alongside product data."
        >
          <div className="health-card">
            <div className={`health-indicator ${error ? "offline" : "online"}`}>
              <span className="status-dot" />
              {isLoading ? "Checking API..." : error ? error : "API connected"}
            </div>
            <p>
              {data
                ? `Server timestamp: ${new Date(data.timestamp).toLocaleString()}`
                : "The dashboard can surface backend status while training insights stay client-side."}
            </p>
          </div>
        </Card>
      </section>

      <section className="content-grid">
        <Card
          title="Consistency rhythm"
          subtitle="A subtle habit layer built from the same workout log, with a weekly baseline instead of noisy gamification."
        >
          <div className="compact-stack">
            <div className="coach-summary">
              <span className={`status-pill ${habits.tone}`}>{habits.statusLabel}</span>
              <p>{habits.statusDetail}</p>
            </div>

            <HabitWeekStrip days={habits.currentWeek.days} />

            <div className="metric-strip">
              <div className="metric-tile">
                <span>This week</span>
                <strong>
                  {habits.currentWeek.activeDays}/{habits.weeklyTarget} days
                </strong>
              </div>
              <div className="metric-tile">
                <span>Week streak</span>
                <strong>{habits.currentWeekTargetStreak} week(s)</strong>
              </div>
              <div className="metric-tile">
                <span>Best streak</span>
                <strong>{habits.longestWeekTargetStreak} week(s)</strong>
              </div>
            </div>

            <p className="habit-note">{habits.encouragement}</p>

            <div className="compact-stack">
              {habits.recentWeeks.slice(0, 4).map((week) => (
                <article key={week.weekStart} className="habit-summary-row">
                  <div className="habit-summary-copy">
                    <strong>{week.label}</strong>
                    <p>{week.statusLabel}</p>
                  </div>
                  <div className="habit-progress">
                    <div
                      className={`habit-progress-fill ${week.tone}`}
                      style={{ width: `${week.completionRate}%` }}
                    />
                  </div>
                  <span className="meta-pill">
                    {week.activeDays}/{habits.weeklyTarget} days
                  </span>
                </article>
              ))}
            </div>
          </div>
        </Card>

        <Card
          title="Recent activity"
          subtitle="Latest logged lifts, ready to anchor coaching and analytics."
        >
          <div className="stack-list">
            {coaching.recentActivity.map((item, index) => (
              <article
                key={`${item.title}-${item.meta ?? ""}-${index}`}
                className="list-item"
              >
                <div className="list-item-icon">
                  <Activity size={18} />
                </div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                {item.meta ? <span className="meta-pill">{item.meta}</span> : null}
              </article>
            ))}
          </div>
        </Card>

        <Card
          title="Progress snapshot"
          subtitle="A quick read on what the last 30 days of training are saying."
        >
          {workouts.length === 0 ? (
            <div className="mini-note">
              <CalendarRange size={18} />
              <p>
                Add workouts to unlock strongest lifts, personal records, and volume
                snapshots here.
              </p>
            </div>
          ) : (
            <div className="stack-list">
              <article className="list-item">
                <div className="list-item-icon">
                  <Trophy size={18} />
                </div>
                <div>
                  <h4>Strongest recent exercise</h4>
                  <p>
                    {strongestExercise
                      ? `${strongestExercise.exerciseName} has led the last 30 days for top-end load and volume.`
                      : "More history will reveal your strongest movement patterns."}
                  </p>
                </div>
                <span className="meta-pill">
                  {strongestExercise
                    ? `${strongestExercise.maxWeight.toLocaleString()} kg`
                    : "Building"}
                </span>
              </article>
              <article className="list-item">
                <div className="list-item-icon">
                  <HeartPulse size={18} />
                </div>
                <div>
                  <h4>Recent personal records</h4>
                  <p>
                    {progressSnapshot.personalRecords.length > 0
                      ? `${progressSnapshot.personalRecords.length} new record(s) landed inside the last 30 days.`
                      : "No fresh PRs in the current 30-day window yet."}
                  </p>
                </div>
                <span className="meta-pill">
                  {latestRecord
                    ? `${latestRecord.exerciseName} +${latestRecord.improvement.toLocaleString()} kg`
                    : "Stay steady"}
                </span>
              </article>
              <article className="list-item">
                <div className="list-item-icon">
                  <CalendarRange size={18} />
                </div>
                <div>
                  <h4>Training rhythm</h4>
                  <p>
                    {habits.currentWeek.activeDays} active day(s) this week and{" "}
                    {habits.activeDaysLast30} active day(s) across the last 30 days.
                  </p>
                </div>
                <span className="meta-pill">
                  {habits.currentWeekTargetStreak} week streak
                </span>
              </article>
            </div>
          )}
        </Card>

        <Card
          title="Coverage and recovery"
          subtitle="See what has been trained recently and where the next gap is opening."
        >
          {workouts.length === 0 ? (
            <div className="mini-note">
              <HeartPulse size={18} />
              <p>
                Muscle-group coverage and recovery timing start showing up after a few
                logged sessions.
              </p>
            </div>
          ) : (
            <div className="compact-stack">
              <div className="metric-strip">
                <div className="metric-tile">
                  <span>Recent groups</span>
                  <strong>
                    {coaching.trainedCategories.length > 0
                      ? coaching.trainedCategories.join(", ")
                      : "None yet"}
                  </strong>
                </div>
                <div className="metric-tile">
                  <span>Next gap</span>
                  <strong>
                    {coaching.missedCategories[0]
                      ? coaching.missedCategories[0].category
                      : "Balanced"}
                  </strong>
                </div>
              </div>

              <div className="compact-stack">
                {coaching.missedCategories.length === 0 ? (
                  <div className="mini-note">
                    <HeartPulse size={18} />
                    <p>
                      Every tracked muscle group has shown up in the last 14 days.
                      Keep rotating the split instead of repeating one lane.
                    </p>
                  </div>
                ) : (
                  coaching.missedCategories.slice(0, 3).map((entry) => (
                    <article key={entry.category} className="coverage-row">
                      <div>
                        <strong>{entry.category}</strong>
                        <span>
                          {entry.sessionCount} total log{entry.sessionCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <span className="meta-pill">
                        {entry.daysSince} day{entry.daysSince === 1 ? "" : "s"} ago
                      </span>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
