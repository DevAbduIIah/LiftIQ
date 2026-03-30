import {
  Activity,
  Flame,
  RefreshCcw,
  Target,
  TrendingUp
} from "lucide-react";
import type { CoachingInsight } from "../../lib/coaching";

interface CoachingInsightListProps {
  insights: CoachingInsight[];
  emptyTitle: string;
  emptyDescription: string;
}

const iconMap = {
  overload: TrendingUp,
  stagnation: RefreshCcw,
  coverage: Target,
  consistency: Activity,
  recovery: Flame
} as const;

export function CoachingInsightList({
  insights,
  emptyTitle,
  emptyDescription
}: CoachingInsightListProps) {
  if (insights.length === 0) {
    return (
      <div className="mini-note">
        <Target size={18} />
        <p>
          <strong>{emptyTitle}</strong> {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="stack-list">
      {insights.map((insight) => {
        const Icon = iconMap[insight.kind];

        return (
          <article
            key={insight.id}
            className={`list-item coaching-insight ${insight.tone}`}
          >
            <div className="list-item-icon">
              <Icon size={18} />
            </div>
            <div className="coaching-copy">
              <div className="coaching-heading">
                <h4>{insight.title}</h4>
                <span className={`stat-tone ${insight.tone}`}>{insight.label}</span>
              </div>
              <p>{insight.description}</p>
              <p className="coaching-action">{insight.action}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
