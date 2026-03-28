import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonLinkProps {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function ButtonLink({
  to,
  children,
  variant = "primary"
}: ButtonLinkProps) {
  return (
    <Link to={to} className={`button-link ${variant}`}>
      {children}
    </Link>
  );
}
