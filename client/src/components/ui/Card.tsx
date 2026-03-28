import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Card({
  title,
  subtitle,
  children,
  className = ""
}: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {title || subtitle ? (
        <header className="card-header">
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
