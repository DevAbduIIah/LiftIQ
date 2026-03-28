import { BellDot, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

export function SettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Settings"
        title="Profile and preferences placeholder"
        description="This page stays intentionally lightweight in Phase 1 while still feeling like a real part of the product."
      />

      <section className="content-grid three-columns">
        <Card title="Profile">
          <div className="mini-note">
            <UserRound size={18} />
            <p>
              Future home for body metrics, training preferences, and personalized
              dashboard defaults.
            </p>
          </div>
        </Card>

        <Card title="Notifications">
          <div className="mini-note">
            <BellDot size={18} />
            <p>
              Useful reminders can be layered in later without changing the
              navigation or page architecture.
            </p>
          </div>
        </Card>

        <Card title="Privacy">
          <div className="mini-note">
            <ShieldCheck size={18} />
            <p>
              Single-user by default for now, with room to grow into account-aware
              settings if the product evolves.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
