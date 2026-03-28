export interface Workout {
  id: string;
  date: string;
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
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}
