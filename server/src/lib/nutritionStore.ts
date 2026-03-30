import crypto from "node:crypto";
import type {
  NutritionEntry,
  NutritionEntryPayload
} from "../types/nutrition.js";

const nutritionEntries: NutritionEntry[] = [];

function sortNutritionEntries(entries: NutritionEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date);
    }

    if (left.mealType !== right.mealType) {
      return left.mealType.localeCompare(right.mealType);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function listNutritionEntries() {
  return sortNutritionEntries(nutritionEntries);
}

export function createNutritionEntry(payload: NutritionEntryPayload) {
  const timestamp = new Date().toISOString();
  const entry: NutritionEntry = {
    id: crypto.randomUUID(),
    date: payload.date,
    mealType: payload.mealType,
    name: payload.name,
    quantity: payload.quantity ?? "",
    calories: payload.calories,
    protein: payload.protein,
    carbs: payload.carbs,
    fats: payload.fats,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  nutritionEntries.push(entry);

  return entry;
}

export function updateNutritionEntry(id: string, payload: NutritionEntryPayload) {
  const entry = nutritionEntries.find((candidate) => candidate.id === id);

  if (!entry) {
    return null;
  }

  entry.date = payload.date;
  entry.mealType = payload.mealType;
  entry.name = payload.name;
  entry.quantity = payload.quantity ?? "";
  entry.calories = payload.calories;
  entry.protein = payload.protein;
  entry.carbs = payload.carbs;
  entry.fats = payload.fats;
  entry.updatedAt = new Date().toISOString();

  return entry;
}

export function deleteNutritionEntry(id: string) {
  const index = nutritionEntries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return false;
  }

  nutritionEntries.splice(index, 1);

  return true;
}
