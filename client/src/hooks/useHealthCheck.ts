import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "../lib/api";

interface HealthCheckState {
  data: HealthResponse | null;
  error: string | null;
  isLoading: boolean;
}

export function useHealthCheck() {
  const [state, setState] = useState<HealthCheckState>({
    data: null,
    error: null,
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setState({
          data,
          error: null,
          isLoading: false
        });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setState({
          data: null,
          error: "Backend unavailable",
          isLoading: false
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
