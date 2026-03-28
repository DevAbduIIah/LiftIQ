import { Apple, Flame, Salad } from "lucide-react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";

export function NutritionPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Nutrition"
        title="Simple daily fuel tracking"
        description="This page is framed around practical meal logging and macro visibility, ready for Phase 6 without bloating the product early."
      />

      <section className="content-grid two-columns">
        <Card title="Planned nutrition experience" subtitle="Focused on speed and clarity.">
          <div className="stack-list">
            <article className="list-item">
              <div className="list-item-icon">
                <Apple size={18} />
              </div>
              <div>
                <h4>Quick food entries</h4>
                <p>
                  Add meals, calories, protein, carbs, fats, and simple serving
                  info without database complexity.
                </p>
              </div>
            </article>
            <article className="list-item">
              <div className="list-item-icon">
                <Flame size={18} />
              </div>
              <div>
                <h4>Target vs actual</h4>
                <p>
                  Compare daily intake against your goals through clean summaries
                  instead of dense tables.
                </p>
              </div>
            </article>
          </div>
        </Card>

        <Card title="Daily log">
          <EmptyState
            title="Meals have not been tracked yet"
            description="This section will turn into a daily nutrition feed with edit/delete actions and macro rollups."
            actions={
              <div className="mini-note">
                <Salad size={18} />
                <p>
                  Phase 6 expands LiftIQ beyond workouts into full-day fitness
                  management.
                </p>
              </div>
            }
          />
        </Card>
      </section>
    </div>
  );
}
