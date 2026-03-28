export const exerciseCategories = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Full Body",
  "Conditioning"
] as const;

export type ExerciseCategory = (typeof exerciseCategories)[number];

export interface Workout {
  id: string;
  date: string;
  category: ExerciseCategory;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPayload {
  date: string;
  category: ExerciseCategory;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
}
