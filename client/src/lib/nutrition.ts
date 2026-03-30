import type { NutritionEntry } from "../types/nutrition";

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionTargets extends MacroTotals {}

export interface DailyNutritionSummary extends MacroTotals {
  entries: NutritionEntry[];
}

export const defaultNutritionTargets: NutritionTargets = {
  calories: 2400,
  protein: 180,
  carbs: 250,
  fats: 75
};

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function formatNutritionDate(value: string) {
  return parseDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function buildMacroTotals(entries: NutritionEntry[]): MacroTotals {
  return entries.reduce<MacroTotals>(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fats: totals.fats + entry.fats
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    }
  );
}

export function buildDailyNutritionSummary(
  entries: NutritionEntry[],
  selectedDate: string
): DailyNutritionSummary {
  const filteredEntries = entries.filter((entry) => entry.date === selectedDate);
  const totals = buildMacroTotals(filteredEntries);

  return {
    entries: filteredEntries,
    ...totals
  };
}

export function buildMacroProgress(
  totals: MacroTotals,
  targets: NutritionTargets
) {
  return [
    {
      key: "calories",
      label: "Calories",
      unit: "kcal",
      current: totals.calories,
      target: targets.calories
    },
    {
      key: "protein",
      label: "Protein",
      unit: "g",
      current: totals.protein,
      target: targets.protein
    },
    {
      key: "carbs",
      label: "Carbs",
      unit: "g",
      current: totals.carbs,
      target: targets.carbs
    },
    {
      key: "fats",
      label: "Fats",
      unit: "g",
      current: totals.fats,
      target: targets.fats
    }
  ].map((metric) => {
    const remaining = metric.target - metric.current;
    const ratio = metric.target === 0 ? 0 : metric.current / metric.target;

    return {
      ...metric,
      remaining,
      ratio,
      percentage: Math.round(ratio * 100)
    };
  });
}

export function buildRecentFoodSuggestions(entries: NutritionEntry[]) {
  const byFood = new Map<string, NutritionEntry>();

  for (const entry of entries) {
    const key = `${entry.name.toLowerCase()}::${entry.mealType}`;

    if (!byFood.has(key)) {
      byFood.set(key, entry);
    }
  }

  return [...byFood.values()].slice(0, 6);
}
