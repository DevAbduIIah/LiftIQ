import {
  Dumbbell,
  LayoutDashboard,
  LineChart,
  Menu,
  Settings,
  Utensils
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { routes } from "../../routes";

const navigationItems = [
  { label: "Dashboard", to: routes.dashboard, icon: LayoutDashboard },
  { label: "Workouts", to: routes.workouts, icon: Dumbbell },
  { label: "Progress", to: routes.progress, icon: LineChart },
  { label: "Nutrition", to: routes.nutrition, icon: Utensils },
  { label: "Settings", to: routes.settings, icon: Settings }
];

export function AppShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">LQ</div>
          <div>
            <p className="brand-name">LiftIQ</p>
            <p className="brand-subtitle">Habit AI + Gym Tracker</p>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navigationItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              to={to}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-promo">
          <p className="sidebar-promo-label">Phase 1 foundation</p>
          <h3>Built for momentum</h3>
          <p>
            Clean structure now, faster feature delivery later. Workout logging
            lands next.
          </p>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <button
            type="button"
            className="icon-button mobile-only"
            onClick={() => setIsMobileNavOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={isMobileNavOpen}
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="topbar-eyebrow">Single-user performance workspace</p>
            <h1>LiftIQ Dashboard</h1>
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            Phase 1
          </div>
        </header>

        {isMobileNavOpen ? (
          <div className="mobile-nav" role="dialog" aria-label="Mobile navigation">
            {navigationItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                to={to}
                onClick={closeMobileNav}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ) : null}

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
