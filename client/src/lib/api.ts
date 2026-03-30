export interface HealthResponse {
  status: "ok";
  app: string;
  timestamp: string;
}

import type {
  NutritionEntry,
  NutritionEntryPayload
} from "../types/nutrition";
import type { Workout, WorkoutPayload } from "../types/workout";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

interface ApiErrorResponse {
  errors?: string[];
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as ApiErrorResponse;

      if (errorBody.errors?.length) {
        message = errorBody.errors.join(" ");
      }
    } catch {
      message = `Request failed with status ${response.status}`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<HealthResponse>("/api/health");
}

interface WorkoutsResponse {
  workouts: Workout[];
}

interface WorkoutResponse {
  workout: Workout;
}

interface NutritionEntriesResponse {
  entries: NutritionEntry[];
}

interface NutritionEntryResponse {
  entry: NutritionEntry;
}

export async function getWorkouts() {
  const response = await request<WorkoutsResponse>("/api/workouts");
  return response.workouts;
}

export async function createWorkout(payload: WorkoutPayload) {
  const response = await request<WorkoutResponse>("/api/workouts", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return response.workout;
}

export async function updateWorkout(id: string, payload: WorkoutPayload) {
  const response = await request<WorkoutResponse>(`/api/workouts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

  return response.workout;
}

export function deleteWorkout(id: string) {
  return request<void>(`/api/workouts/${id}`, {
    method: "DELETE"
  });
}

export async function getNutritionEntries() {
  const response = await request<NutritionEntriesResponse>("/api/nutrition");
  return response.entries;
}

export async function createNutritionEntry(payload: NutritionEntryPayload) {
  const response = await request<NutritionEntryResponse>("/api/nutrition", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return response.entry;
}

export async function updateNutritionEntry(
  id: string,
  payload: NutritionEntryPayload
) {
  const response = await request<NutritionEntryResponse>(`/api/nutrition/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

  return response.entry;
}

export function deleteNutritionEntry(id: string) {
  return request<void>(`/api/nutrition/${id}`, {
    method: "DELETE"
  });
}
