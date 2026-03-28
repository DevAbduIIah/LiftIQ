import { BarChart3, CalendarRange, TrendingUp } from "lucide-react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";

export function ProgressPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Progress"
        title="A future home for clean analytics"
        description="Phase 4 will transform raw workout history into trends, PR tracking, and consistency insights without turning the page into chart overload."
      />

      <section className="content-grid three-columns">
        <Card title="Key metrics">
          <div className="stack-list">
            <article className="list-item compact">
              <BarChart3 size={18} />
              <div>
                <h4>Total volume</h4>
                <p>Understand workload at a glance.</p>
              </div>
            </article>
            <article className="list-item compact">
              <TrendingUp size={18} />
              <div>
                <h4>Lift progression</h4>
                <p>Track improvements on major movements.</p>
              </div>
            </article>
            <article className="list-item compact">
              <CalendarRange size={18} />
              <div>
                <h4>Workout frequency</h4>
                <p>Spot consistency trends over time.</p>
              </div>
            </article>
          </div>
        </Card>

        <Card title="Analytics canvas" className="wide-card">
          <EmptyState
            title="Charts unlock after workout data exists"
            description="The layout is ready for time-range filters, trend visualizations, and strongest-lift summaries once tracking begins."
          />
        </Card>
      </section>
    </div>
  );
}
