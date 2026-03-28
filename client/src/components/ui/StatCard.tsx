import type { SummaryMetric } from "../../types/dashboard";

interface StatCardProps {
  metric: SummaryMetric;
}

export function StatCard({ metric }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-tone ${metric.tone}`}>{metric.tone}</div>
      <p className="stat-label">{metric.label}</p>
      <h3>{metric.value}</h3>
      <p className="stat-change">{metric.change}</p>
    </article>
  );
}
