import {
  Award,
  CalendarRange,
  Flame,
  LoaderCircle,
  Repeat,
  TrendingUp,
  Trophy,
  Weight
} from "lucide-react";
import { useState } from "react";
import { CoachingInsightList } from "../components/ui/CoachingInsightList";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { HabitWeekStrip } from "../components/ui/HabitWeekStrip";
import { PageHeader } from "../components/ui/PageHeader";
import { TrendChart } from "../components/ui/TrendChart";
import { buildCoachingSnapshot } from "../lib/coaching";
import { buildHabitSnapshot } from "../lib/habits";
import {
  buildProgressAnalytics,
  type ComparisonMetric,
  type TimeRange
} from "../lib/progress";
import { useWorkouts } from "../hooks/useWorkouts";

const timeRangeOptions: Array<{ value: TimeRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" }
];

function formatDelta(metric: ComparisonMetric, suffix = "") {
  if (metric.delta === null || metric.delta === 0) {
    return "Flat vs previous window";
  }

  const direction = metric.delta > 0 ? "up" : "down";
  const absolute = Math.abs(metric.delta);
  return `${direction} ${absolute.toLocaleString()}${suffix} vs previous window`;
}

export function ProgressPage() {
  const { workouts, isLoading, error, reload } = useWorkouts();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const analytics = buildProgressAnalytics(workouts, timeRange);
  const coaching = buildCoachingSnapshot(workouts);
  const habits = buildHabitSnapshot(workouts);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Progress"
        title="Meaningful trends from your training logs"
        description="See how weight, volume, frequency, and consistency are moving over time, then use that signal to spot personal records and strongest lifts."
      />

      <section className="filter-pill-row">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`time-filter-button ${
              timeRange === option.value ? "active" : ""
            }`}
            onClick={() => setTimeRange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </section>

      {isLoading ? (
        <Card title="Progress analytics">
          <div className="loading-state">
            <LoaderCircle size={18} className="spin" />
            <p>Loading analytics...</p>
          </div>
        </Card>
      ) : error ? (
        <Card title="Progress analytics">
          <div className="alert-banner error">
            <p>{error}</p>
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
        </Card>
      ) : workouts.length === 0 ? (
        <Card title="Progress analytics">
          <EmptyState
            title="Analytics unlock after your first workouts"
            description="Log a few sessions in Workouts and LiftIQ will start showing trends, personal records, strongest exercises, and consistency indicators here."
          />
        </Card>
      ) : analytics.filteredWorkouts.length === 0 ? (
        <Card title="Progress analytics">
          <EmptyState
            title="No workouts in this range"
            description="Try a wider time window to pull more training history into the analytics view."
          />
        </Card>
      ) : (
        <>
          <section className="stats-grid workout-summary-grid">
            <article className="stat-card">
              <div className="stat-tone neutral">Tracked volume</div>
              <p className="stat-label">Selected range</p>
              <h3>{analytics.totalVolume.toLocaleString()} kg</h3>
              <p className="stat-change">Total work completed in the chosen window.</p>
            </article>
            <article className="stat-card">
              <div className="stat-tone neutral">Heaviest lift</div>
              <p className="stat-label">Top load moved</p>
              <h3>{analytics.heaviestWeight.toLocaleString()} kg</h3>
              <p className="stat-change">Best working weight in the current range.</p>
            </article>
            <article className="stat-card">
              <div className="stat-tone neutral">Active days</div>
              <p className="stat-label">Training frequency</p>
              <h3>{analytics.activeDays}</h3>
              <p className="stat-change">
                {analytics.consistency.sessionsPerWeek.toLocaleString()} sessions per week on average.
              </p>
            </article>
            <article className="stat-card">
              <div className="stat-tone attention">Recent PRs</div>
              <p className="stat-label">New records found</p>
              <h3>{analytics.personalRecords.length}</h3>
              <p className="stat-change">Only logs that beat a previous best are counted.</p>
            </article>
          </section>

          <section className="content-grid three-columns progress-charts-grid">
            <TrendChart
              title="Lifted weight trend"
              subtitle="Daily top working weight across the selected range."
              points={analytics.weightTrend}
              valueLabel="Latest top set"
              valueFormatter={(value) => `${value.toLocaleString()} kg`}
            />
            <TrendChart
              title="Total volume trend"
              subtitle="Daily workload based on sets x reps x weight."
              points={analytics.volumeTrend}
              valueLabel="Latest volume"
              valueFormatter={(value) => `${value.toLocaleString()} kg`}
            />
            <TrendChart
              title="Workout frequency"
              subtitle="How many entries landed on each active training day."
              points={analytics.frequencyTrend}
              valueLabel="Latest entries"
              valueFormatter={(value) => `${value.toLocaleString()} lifts`}
              variant="bar"
            />
          </section>

          <section className="content-grid two-columns">
            <Card
              title="Coaching guidance"
              subtitle="The same workout history behind the charts also powers these practical next-step prompts."
            >
              <CoachingInsightList
                insights={coaching.insights}
                emptyTitle="Coaching is waiting on a little more history."
                emptyDescription="Keep logging consistently and this area will start surfacing clearer training prompts."
              />
            </Card>

            <Card
              title="Coverage and recovery"
              subtitle="Use the broader context around the charts to decide what to train next."
            >
              <div className="stack-list">
                <article className="list-item">
                  <div className="list-item-icon">
                    <Flame size={18} />
                  </div>
                  <div>
                    <h4>{coaching.readiness.label}</h4>
                    <p>{coaching.readiness.detail}</p>
                  </div>
                  <span className={`stat-tone ${coaching.readiness.tone}`}>Readiness</span>
                </article>
                <article className="list-item">
                  <div className="list-item-icon">
                    <Repeat size={18} />
                  </div>
                  <div>
                    <h4>Recent muscle-group coverage</h4>
                    <p>
                      {coaching.trainedCategories.length > 0
                        ? coaching.trainedCategories.join(", ")
                        : "No recent category coverage yet."}
                    </p>
                  </div>
                  <span className="meta-pill">
                    {coaching.trainedCategories.length}/{Math.max(coaching.trackedCategories.length, 1)}
                  </span>
                </article>
                <article className="list-item">
                  <div className="list-item-icon">
                    <CalendarRange size={18} />
                  </div>
                  <div>
                    <h4>Oldest category gap</h4>
                    <p>
                      {coaching.missedCategories[0]
                        ? `${coaching.missedCategories[0].category} has been idle for ${coaching.missedCategories[0].daysSince} day(s).`
                        : "Every tracked category has shown up in the last 14 days."}
                    </p>
                  </div>
                  <span className="meta-pill">
                    {coaching.missedCategories[0]
                      ? coaching.missedCategories[0].lastTrained
                      : "Balanced"}
                  </span>
                </article>
              </div>
            </Card>
          </section>

          <section className="content-grid two-columns">
            <Card
              title="Recent progress"
              subtitle="Comparison versus the previous matching window to make momentum easier to spot."
            >
              <div className="stack-list">
                <article className="list-item">
                  <div className="list-item-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4>Volume</h4>
                    <p>{formatDelta(analytics.recentProgress[0], " kg")}</p>
                  </div>
                  <span className="meta-pill">
                    {analytics.recentProgress[0].current.toLocaleString()} kg
                  </span>
                </article>
                <article className="list-item">
                  <div className="list-item-icon">
                    <Weight size={18} />
                  </div>
                  <div>
                    <h4>Heaviest lift</h4>
                    <p>{formatDelta(analytics.recentProgress[1], " kg")}</p>
                  </div>
                  <span className="meta-pill">
                    {analytics.recentProgress[1].current.toLocaleString()} kg
                  </span>
                </article>
                <article className="list-item">
                  <div className="list-item-icon">
                    <CalendarRange size={18} />
                  </div>
                  <div>
                    <h4>Active days</h4>
                    <p>{formatDelta(analytics.recentProgress[2])}</p>
                  </div>
                  <span className="meta-pill">
                    {analytics.recentProgress[2].current.toLocaleString()} days
                  </span>
                </article>
              </div>
            </Card>

            <Card
              title="Personal records"
              subtitle="Recent lifts that genuinely cleared a previous best for the same exercise."
            >
              {analytics.personalRecords.length === 0 ? (
                <div className="mini-note">
                  <Award size={18} />
                  <p>
                    No fresh PRs showed up in this range yet. Keep logging consistently
                    and LiftIQ will surface them here automatically.
                  </p>
                </div>
              ) : (
                <div className="stack-list">
                  {analytics.personalRecords.map((record) => (
                    <article key={record.id} className="list-item">
                      <div className="list-item-icon">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <h4>{record.exerciseName}</h4>
                        <p>
                          {record.category} | {new Date(`${record.date}T00:00:00`).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="meta-pill">
                        +{record.improvement.toLocaleString()} kg
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section className="content-grid two-columns">
            <Card
              title="Strongest exercises"
              subtitle="The movements where your current logs show the most strength and workload."
            >
              <div className="stack-list">
                {analytics.strongestExercises.map((exercise) => (
                  <article key={`${exercise.category}:${exercise.exerciseName}`} className="workout-entry compact-card">
                    <div className="workout-entry-header">
                      <div>
                        <h4>{exercise.exerciseName}</h4>
                        <p>{exercise.category}</p>
                      </div>
                      <span className="meta-pill">
                        {exercise.maxWeight.toLocaleString()} kg max
                      </span>
                    </div>
                    <div className="metric-strip">
                      <div className="metric-tile">
                        <span>Total volume</span>
                        <strong>{exercise.totalVolume.toLocaleString()} kg</strong>
                      </div>
                      <div className="metric-tile">
                        <span>Sessions</span>
                        <strong>{exercise.sessions}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Card>

            <Card
              title="Habit rhythm"
              subtitle="Weekly target tracking, streaks, and active-day feedback without turning consistency into a cartoon."
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
                  <div className="metric-tile">
                    <span>Active days</span>
                    <strong>{habits.activeDaysLast30} in 30 days</strong>
                  </div>
                </div>

                <p className="habit-note">{habits.encouragement}</p>

                <div className="compact-stack">
                  {habits.recentWeeks.map((week) => (
                    <article key={week.weekStart} className="habit-summary-row">
                      <div className="habit-summary-copy">
                        <strong>{week.label}</strong>
                        <p>{week.statusDetail}</p>
                      </div>
                      <div className="habit-progress">
                        <div
                          className={`habit-progress-fill ${week.tone}`}
                          style={{ width: `${week.completionRate}%` }}
                        />
                      </div>
                      <span className="meta-pill">
                        {week.activeDays}/{habits.weeklyTarget}
                      </span>
                    </article>
                  ))}
                </div>

                <div className="stack-list">
                  <article className="list-item compact">
                    <div className="list-item-icon">
                      <Repeat size={18} />
                    </div>
                    <div>
                      <h4>Active weeks in range</h4>
                      <p>
                        {analytics.consistency.activeWeeks} of {analytics.consistency.totalWeeks} weeks had logged training in the selected window.
                      </p>
                    </div>
                    <span className="meta-pill">
                      {Math.round(
                        (analytics.consistency.activeWeeks /
                          Math.max(analytics.consistency.totalWeeks, 1)) *
                          100
                      )}
                      %
                    </span>
                  </article>
                  <article className="list-item compact">
                    <div className="list-item-icon">
                      <Flame size={18} />
                    </div>
                    <div>
                      <h4>Back-to-back active days</h4>
                      <p>
                        Current run: {habits.currentActiveDayStreak} day(s) | best run: {habits.longestActiveDayStreak} day(s).
                      </p>
                    </div>
                    <span className="meta-pill">Daily rhythm</span>
                  </article>
                  <article className="list-item compact">
                    <div className="list-item-icon">
                      <CalendarRange size={18} />
                    </div>
                    <div>
                      <h4>Last workout gap</h4>
                      <p>
                        {habits.daysSinceLastWorkout === null
                          ? "No workout history yet."
                          : `${habits.daysSinceLastWorkout} day(s) since your most recent logged session.`}
                      </p>
                    </div>
                    <span className="meta-pill">
                      {analytics.consistency.sessionsPerWeek.toLocaleString()} / week
                    </span>
                  </article>
                </div>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
