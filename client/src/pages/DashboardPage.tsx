import { Activity, ArrowRight, HeartPulse, Sparkles } from "lucide-react";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import {
  dashboardHighlights,
  recentActivity,
  summaryMetrics,
  upcomingMilestones
} from "../data/dashboard";
import { useHealthCheck } from "../hooks/useHealthCheck";
import { routes } from "../routes";

export function DashboardPage() {
  const { data, error, isLoading } = useHealthCheck();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Command center"
        title="Train with clarity from day one"
        description="LiftIQ starts with a polished workspace today, then grows into a smarter logging and coaching product across later phases."
        actions={<ButtonLink to={routes.workouts}>Open workouts</ButtonLink>}
      />

      <section className="stats-grid">
        {summaryMetrics.map((metric) => (
          <StatCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="dashboard-grid">
        <Card
          title="Ready for your first session"
          subtitle="The shell is live, and the workflow is set up for workout tracking next."
          className="hero-card"
        >
          <EmptyState
            title="No training data yet"
            description="Start with workouts when Phase 2 lands, then layer in progress analytics, nutrition, and coaching without rebuilding the foundation."
            actions={
              <>
                <ButtonLink to={routes.workouts}>Explore workouts</ButtonLink>
                <ButtonLink to={routes.nutrition} variant="secondary">
                  Preview nutrition
                </ButtonLink>
              </>
            }
          />
        </Card>

        <Card
          title="Platform health"
          subtitle="Backend connectivity is wired into the frontend from the start."
        >
          <div className="health-card">
            <div className={`health-indicator ${error ? "offline" : "online"}`}>
              <span className="status-dot" />
              {isLoading ? "Checking API..." : error ? error : "API connected"}
            </div>
            <p>
              {data
                ? `Server timestamp: ${new Date(data.timestamp).toLocaleString()}`
                : "The dashboard can surface backend status even before feature APIs arrive."}
            </p>
          </div>
        </Card>
      </section>

      <section className="content-grid">
        <Card
          title="Recent activity"
          subtitle="A future-ready home for sessions, milestones, and notes."
        >
          <div className="stack-list">
            {recentActivity.map((item) => (
              <article key={item.title} className="list-item">
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

        <Card title="Progress snapshots" subtitle="Readable analytics, not clutter.">
          <div className="highlight-panel">
            <div className="chart-placeholder">
              <span>Volume trend</span>
              <div className="chart-bars">
                <div style={{ height: "36%" }} />
                <div style={{ height: "42%" }} />
                <div style={{ height: "58%" }} />
                <div style={{ height: "70%" }} />
                <div style={{ height: "84%" }} />
              </div>
            </div>

            <div className="mini-note">
              <HeartPulse size={18} />
              <p>
                Once sessions exist, this area will spotlight momentum,
                strongest lifts, and consistency at a glance.
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="What is coming next"
          subtitle="Phase-by-phase delivery without throwing away earlier work."
        >
          <div className="stack-list">
            {upcomingMilestones.map((item) => (
              <article key={item.title} className="milestone-row">
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                <span className="meta-pill">{item.meta}</span>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="highlight-grid">
        {dashboardHighlights.map((highlight) => (
          <Card key={highlight.title}>
            <p className="section-eyebrow">{highlight.eyebrow}</p>
            <div className="feature-callout">
              <div>
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
              </div>
              <Sparkles size={20} />
            </div>
          </Card>
        ))}

        <Card
          title="Navigation designed for growth"
          subtitle="Each page already has a real layout target, not just a placeholder heading."
        >
          <ButtonLink to={routes.progress} variant="secondary">
            View product skeleton <ArrowRight size={16} />
          </ButtonLink>
        </Card>
      </section>
    </div>
  );
}
