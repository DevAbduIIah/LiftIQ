import { useCallback, useEffect, useState } from "react";
import {
  createNutritionEntry,
  deleteNutritionEntry,
  getNutritionEntries,
  updateNutritionEntry
} from "../lib/api";
import type {
  NutritionEntry,
  NutritionEntryPayload
} from "../types/nutrition";

interface UseNutritionState {
  entries: NutritionEntry[];
  isLoading: boolean;
  error: string | null;
}

function sortEntries(entries: NutritionEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function useNutrition() {
  const [state, setState] = useState<UseNutritionState>({
    entries: [],
    isLoading: true,
    error: null
  });

  const loadEntries = useCallback(async () => {
    try {
      const entries = await getNutritionEntries();

      setState({
        entries,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState({
        entries: [],
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unable to load nutrition entries."
      });
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const createEntry = useCallback(async (payload: NutritionEntryPayload) => {
    const entry = await createNutritionEntry(payload);

    setState((current) => ({
      ...current,
      entries: sortEntries([entry, ...current.entries])
    }));

    return entry;
  }, []);

  const updateEntry = useCallback(
    async (id: string, payload: NutritionEntryPayload) => {
      const entry = await updateNutritionEntry(id, payload);

      setState((current) => ({
        ...current,
        entries: sortEntries(
          current.entries.map((candidate) => (candidate.id === id ? entry : candidate))
        )
      }));

      return entry;
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    await deleteNutritionEntry(id);

    setState((current) => ({
      ...current,
      entries: current.entries.filter((candidate) => candidate.id !== id)
    }));
  }, []);

  return {
    ...state,
    reload: loadEntries,
    createEntry,
    updateEntry,
    deleteEntry
  };
}
