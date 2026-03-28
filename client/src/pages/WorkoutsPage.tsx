import { Clock3, Dumbbell, PencilRuler } from "lucide-react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";

export function WorkoutsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Workouts"
        title="Fast logging workspace"
        description="This page is already structured for a practical training workflow, with room for quick-entry forms, history, and editing."
      />

      <section className="content-grid two-columns">
        <Card title="Logging flow preview" subtitle="Phase 2 turns this into a real workout form.">
          <div className="stack-list">
            <article className="list-item">
              <div className="list-item-icon">
                <Dumbbell size={18} />
              </div>
              <div>
                <h4>Exercise-driven entry</h4>
                <p>
                  Date, exercise, sets, reps, weight, and notes are all planned
                  into the upcoming form flow.
                </p>
              </div>
            </article>
            <article className="list-item">
              <div className="list-item-icon">
                <Clock3 size={18} />
              </div>
              <div>
                <h4>Built for repeated use</h4>
                <p>
                  The page layout already reserves space for fast iteration,
                  low-friction logging, and history beside the form.
                </p>
              </div>
            </article>
          </div>
        </Card>

        <Card title="History lane" subtitle="A clear home for future workout records and filters.">
          <EmptyState
            title="No workout history yet"
            description="Once workout tracking is implemented, this column will become the readable session history with edit and delete actions."
          />
        </Card>
      </section>

      <Card
        title="Why this structure matters"
        subtitle="The shell avoids a blank screen while keeping room for the real feature."
      >
        <div className="mini-note">
          <PencilRuler size={18} />
          <p>
            The page is intentionally split between data entry and review so later
            phases can add functionality without reworking the layout.
          </p>
        </div>
      </Card>
    </div>
  );
}
