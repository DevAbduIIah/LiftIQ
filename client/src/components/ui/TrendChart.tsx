import type { TrendPoint } from "../../lib/progress";

interface TrendChartProps {
  title: string;
  subtitle: string;
  points: TrendPoint[];
  valueLabel: string;
  valueFormatter: (value: number) => string;
  variant?: "line" | "bar";
}

export function TrendChart({
  title,
  subtitle,
  points,
  valueLabel,
  valueFormatter,
  variant = "line"
}: TrendChartProps) {
  if (points.length === 0) {
    return (
      <section className="chart-card">
        <header className="card-header">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </header>
        <div className="chart-empty">
          <p>No data in the selected range yet.</p>
        </div>
      </section>
    );
  }

  const latestPoint = points[points.length - 1];
  const peakPoint = points.reduce((best, point) =>
    point.value > best.value ? point : best
  );
  const width = 100;
  const height = 52;
  const padding = 6;
  const minValue =
    variant === "line"
      ? Math.min(...points.map((point) => point.value))
      : 0;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const range = maxValue - minValue || 1;

  const polyline = points
    .map((point, index) => {
      const x =
        points.length === 1
          ? width / 2
          : (index / (points.length - 1)) * (width - padding * 2) + padding;
      const normalized = (point.value - minValue) / range;
      const y = height - padding - normalized * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="chart-card">
      <header className="card-header">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </header>

      <div className="chart-summary">
        <div>
          <span>{valueLabel}</span>
          <strong>{valueFormatter(latestPoint.value)}</strong>
        </div>
        <div>
          <span>Peak</span>
          <strong>{valueFormatter(peakPoint.value)}</strong>
        </div>
      </div>

      {variant === "line" ? (
        <div className="chart-surface">
          <svg
            className="trend-svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline className="trend-line" points={polyline} />
          </svg>
        </div>
      ) : (
        <div className="bar-chart-surface">
          {points.map((point) => (
            <div key={point.date} className="bar-chart-column">
              <div
                className="bar-chart-bar"
                style={{ height: `${(point.value / maxValue) * 100}%` }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="chart-footnote">
        <span>{points[0].label}</span>
        <span>{latestPoint.label}</span>
      </div>
    </section>
  );
}
