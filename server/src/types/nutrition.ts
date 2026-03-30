export const mealTypes = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Pre-workout",
  "Post-workout"
] as const;

export type MealType = (typeof mealTypes)[number];

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionEntryPayload {
  date: string;
  mealType: MealType;
  name: string;
  quantity?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}
