import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: PageHeaderProps) {
  return (
    <section className="page-header">
      <div>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  );
}
