import { useCallback, useEffect, useState } from "react";
import {
  createWorkout,
  deleteWorkout,
  getWorkouts,
  updateWorkout
} from "../lib/api";
import type { Workout, WorkoutPayload } from "../types/workout";

interface UseWorkoutsState {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
}

export function useWorkouts() {
  const [state, setState] = useState<UseWorkoutsState>({
    workouts: [],
    isLoading: true,
    error: null
  });

  const loadWorkouts = useCallback(async () => {
    try {
      const workouts = await getWorkouts();

      setState({
        workouts,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState({
        workouts: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Unable to load workouts."
      });
    }
  }, []);

  useEffect(() => {
    void loadWorkouts();
  }, [loadWorkouts]);

  const createEntry = useCallback(async (payload: WorkoutPayload) => {
    const workout = await createWorkout(payload);

    setState((current) => ({
      ...current,
      workouts: [workout, ...current.workouts]
    }));

    return workout;
  }, []);

  const updateEntry = useCallback(async (id: string, payload: WorkoutPayload) => {
    const workout = await updateWorkout(id, payload);

    setState((current) => ({
      ...current,
      workouts: current.workouts
        .map((entry) => (entry.id === id ? workout : entry))
        .sort((left, right) => {
          if (left.date !== right.date) {
            return right.date.localeCompare(left.date);
          }

          return right.updatedAt.localeCompare(left.updatedAt);
        })
    }));

    return workout;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await deleteWorkout(id);

    setState((current) => ({
      ...current,
      workouts: current.workouts.filter((entry) => entry.id !== id)
    }));
  }, []);

  return {
    ...state,
    reload: loadWorkouts,
    createEntry,
    updateEntry,
    deleteEntry
  };
}
