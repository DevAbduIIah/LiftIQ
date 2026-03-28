export interface SummaryMetric {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "neutral" | "attention";
}

export interface DashboardPanelItem {
  title: string;
  description: string;
  meta?: string;
}

export interface DashboardHighlight {
  eyebrow: string;
  title: string;
  description: string;
}
