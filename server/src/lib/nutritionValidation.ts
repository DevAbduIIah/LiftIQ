import {
  mealTypes,
  type NutritionEntryPayload
} from "../types/nutrition.js";

export interface ValidationResult {
  data?: NutritionEntryPayload;
  errors?: string[];
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function validateNutritionPayload(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") {
    return {
      errors: ["Nutrition payload is required."]
    };
  }

  const candidate = input as Record<string, unknown>;
  const date = String(candidate.date ?? "").trim();
  const mealType = String(candidate.mealType ?? "").trim();
  const name = String(candidate.name ?? "").trim();
  const quantity = String(candidate.quantity ?? "").trim();
  const calories = parseNumber(candidate.calories);
  const protein = parseNumber(candidate.protein);
  const carbs = parseNumber(candidate.carbs);
  const fats = parseNumber(candidate.fats);
  const errors: string[] = [];

  if (!isValidDate(date)) {
    errors.push("Date must use the YYYY-MM-DD format.");
  }

  if (!mealTypes.includes(mealType as (typeof mealTypes)[number])) {
    errors.push("Choose a valid meal type.");
  }

  if (name.length < 2) {
    errors.push("Food name must be at least 2 characters.");
  }

  if (name.length > 80) {
    errors.push("Food name must be 80 characters or fewer.");
  }

  if (quantity.length > 60) {
    errors.push("Quantity must be 60 characters or fewer.");
  }

  if (!Number.isFinite(calories) || calories < 0 || calories > 5000) {
    errors.push("Calories must be between 0 and 5000.");
  }

  if (!Number.isFinite(protein) || protein < 0 || protein > 500) {
    errors.push("Protein must be between 0 and 500 grams.");
  }

  if (!Number.isFinite(carbs) || carbs < 0 || carbs > 1000) {
    errors.push("Carbs must be between 0 and 1000 grams.");
  }

  if (!Number.isFinite(fats) || fats < 0 || fats > 300) {
    errors.push("Fats must be between 0 and 300 grams.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      date,
      mealType: mealType as NutritionEntryPayload["mealType"],
      name,
      quantity,
      calories,
      protein,
      carbs,
      fats
    }
  };
}
