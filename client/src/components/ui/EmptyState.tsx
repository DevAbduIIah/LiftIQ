import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actions
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-orb" />
      <h3>{title}</h3>
      <p>{description}</p>
      {actions ? <div className="empty-state-actions">{actions}</div> : null}
    </div>
  );
}
