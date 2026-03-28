import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { NutritionPage } from "./pages/NutritionPage";
import { ProgressPage } from "./pages/ProgressPage";
import { routes } from "./routes";
import { SettingsPage } from "./pages/SettingsPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";

export const router = createBrowserRouter([
  {
    path: routes.dashboard,
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: routes.workouts.slice(1),
        element: <WorkoutsPage />
      },
      {
        path: routes.progress.slice(1),
        element: <ProgressPage />
      },
      {
        path: routes.nutrition.slice(1),
        element: <NutritionPage />
      },
      {
        path: routes.settings.slice(1),
        element: <SettingsPage />
      }
    ]
  }
]);
