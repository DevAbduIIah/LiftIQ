import type { ExerciseCategory } from "../types/workout";

export const exercisePresets: Record<ExerciseCategory, string[]> = {
  Chest: ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Fly"],
  Back: ["Barbell Row", "Lat Pulldown", "Seated Cable Row"],
  Legs: ["Back Squat", "Romanian Deadlift", "Leg Press"],
  Shoulders: ["Overhead Press", "Lateral Raise", "Rear Delt Fly"],
  Arms: ["Barbell Curl", "Hammer Curl", "Cable Triceps Pushdown"],
  Core: ["Cable Crunch", "Hanging Knee Raise", "Ab Wheel Rollout"],
  "Full Body": ["Deadlift", "Clean and Press", "Thruster"],
  Conditioning: ["Sled Push", "Rowing Intervals", "Bike Sprint"]
};

export const categoryDescriptions: Record<ExerciseCategory, string> = {
  Chest: "Pressing and fly variations focused on upper-body pushing strength.",
  Back: "Pulling movements for lats, mid-back strength, and posture.",
  Legs: "Squat, hinge, and lower-body accessories that build total leg strength.",
  Shoulders: "Overhead strength and delt-focused accessory work.",
  Arms: "Direct biceps and triceps work to round out upper-body sessions.",
  Core: "Bracing, trunk control, and abdominal accessory movements.",
  "Full Body": "Big compound lifts that train multiple regions at once.",
  Conditioning: "Work capacity, intervals, and athletic finishers."
};
