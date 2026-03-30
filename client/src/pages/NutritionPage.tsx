import {
  Apple,
  Beef,
  CalendarDays,
  Filter,
  Flame,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Wheat
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useNutrition } from "../hooks/useNutrition";
import {
  buildDailyNutritionSummary,
  buildMacroProgress,
  buildRecentFoodSuggestions,
  defaultNutritionTargets,
  formatNutritionDate
} from "../lib/nutrition";
import type {
  MealType,
  NutritionEntry,
  NutritionEntryPayload
} from "../types/nutrition";
import { mealTypes } from "../types/nutrition";

interface FormState {
  date: string;
  mealType: MealType;
  name: string;
  quantity: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

function createDefaultFormState(selectedDate?: string): FormState {
  return {
    date: selectedDate ?? new Date().toISOString().slice(0, 10),
    mealType: "Breakfast",
    name: "",
    quantity: "",
    calories: "0",
    protein: "0",
    carbs: "0",
    fats: "0"
  };
}

function validateForm(form: FormState) {
  const errors: string[] = [];
  const name = form.name.trim();
  const quantity = form.quantity.trim();
  const calories = Number(form.calories);
  const protein = Number(form.protein);
  const carbs = Number(form.carbs);
  const fats = Number(form.fats);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
    errors.push("Choose a valid nutrition date.");
  }

  if (!mealTypes.includes(form.mealType)) {
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

  return errors;
}

function toPayload(form: FormState): NutritionEntryPayload {
  return {
    date: form.date,
    mealType: form.mealType,
    name: form.name.trim(),
    quantity: form.quantity.trim(),
    calories: Number(form.calories),
    protein: Number(form.protein),
    carbs: Number(form.carbs),
    fats: Number(form.fats)
  };
}

function toFormState(entry: NutritionEntry): FormState {
  return {
    date: entry.date,
    mealType: entry.mealType,
    name: entry.name,
    quantity: entry.quantity,
    calories: String(entry.calories),
    protein: String(entry.protein),
    carbs: String(entry.carbs),
    fats: String(entry.fats)
  };
}

function buildEntryLabel(entry: Pick<NutritionEntryPayload, "mealType" | "name" | "quantity">) {
  if (entry.quantity.trim().length === 0) {
    return `${entry.mealType} | ${entry.name}`;
  }

  return `${entry.mealType} | ${entry.name} | ${entry.quantity}`;
}

export function NutritionPage() {
  const {
    entries,
    isLoading,
    error,
    reload,
    createEntry,
    updateEntry,
    deleteEntry
  } = useNutrition();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [form, setForm] = useState<FormState>(() =>
    createDefaultFormState(new Date().toISOString().slice(0, 10))
  );
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState<"All" | MealType>("All");

  useEffect(() => {
    if (!editingEntryId) {
      setForm((current) => ({
        ...current,
        date: selectedDate
      }));
    }
  }, [editingEntryId, selectedDate]);

  const daySummary = buildDailyNutritionSummary(entries, selectedDate);
  const macroProgress = buildMacroProgress(daySummary, defaultNutritionTargets);
  const recentFoodSuggestions = buildRecentFoodSuggestions(entries);
  const totalDaysTracked = new Set(entries.map((entry) => entry.date)).size;
  const selectedDayEntryCount = daySummary.entries.length;
  const entriesForLog = entries.filter((entry) => {
    if (entry.date !== selectedDate) {
      return false;
    }

    if (mealTypeFilter !== "All" && entry.mealType !== mealTypeFilter) {
      return false;
    }

    const searchValue = searchTerm.trim().toLowerCase();

    if (searchValue.length === 0) {
      return true;
    }

    return (
      entry.name.toLowerCase().includes(searchValue) ||
      entry.quantity.toLowerCase().includes(searchValue) ||
      entry.mealType.toLowerCase().includes(searchValue)
    );
  });

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function resetComposer() {
    setForm(createDefaultFormState(selectedDate));
    setEditingEntryId(null);
    setValidationErrors([]);
    setSubmitError(null);
  }

  function loadSuggestion(entry: NutritionEntry) {
    setEditingEntryId(null);
    setValidationErrors([]);
    setSubmitError(null);
    setForm({
      date: selectedDate,
      mealType: entry.mealType,
      name: entry.name,
      quantity: entry.quantity,
      calories: String(entry.calories),
      protein: String(entry.protein),
      carbs: String(entry.carbs),
      fats: String(entry.fats)
    });
  }

  function startEditingEntry(entry: NutritionEntry) {
    setEditingEntryId(entry.id);
    setSelectedDate(entry.date);
    setValidationErrors([]);
    setSubmitError(null);
    setForm(toFormState(entry));
  }

  async function handleSaveEntry() {
    const errors = validateForm(form);
    setValidationErrors(errors);
    setSubmitError(null);

    if (errors.length > 0) {
      return;
    }

    const payload = toPayload(form);

    try {
      setIsSubmitting(true);

      if (editingEntryId) {
        await updateEntry(editingEntryId, payload);
      } else {
        await createEntry(payload);
      }

      setSelectedDate(payload.date);
      resetComposer();
    } catch (saveError) {
      setSubmitError(
        saveError instanceof Error ? saveError.message : "Unable to save meal entry."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteEntry(entry: NutritionEntry) {
    const confirmed = window.confirm(
      `Delete ${entry.name} from ${formatNutritionDate(entry.date)}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEntry(entry.id);

      if (editingEntryId === entry.id) {
        resetComposer();
      }
    } catch (deleteError) {
      setSubmitError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete nutrition entry."
      );
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Nutrition"
        title="Simple daily fuel tracking that stays fast"
        description="Log meals with just the data that matters, review daily totals instantly, and compare intake against practical macro targets without turning the page into a food database."
      />

      <section className="stats-grid workout-summary-grid">
        <article className="stat-card">
          <div className="stat-tone neutral">Selected day</div>
          <p className="stat-label">Calories logged</p>
          <h3>{daySummary.calories.toLocaleString()}</h3>
          <p className="stat-change">
            {selectedDayEntryCount} meal entr{selectedDayEntryCount === 1 ? "y" : "ies"} on{" "}
            {formatNutritionDate(selectedDate)}.
          </p>
        </article>
        <article className="stat-card">
          <div className="stat-tone neutral">Protein</div>
          <p className="stat-label">Daily total</p>
          <h3>{daySummary.protein.toLocaleString()} g</h3>
          <p className="stat-change">Compared against a {defaultNutritionTargets.protein} g target.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone neutral">Carbs</div>
          <p className="stat-label">Daily total</p>
          <h3>{daySummary.carbs.toLocaleString()} g</h3>
          <p className="stat-change">Compared against a {defaultNutritionTargets.carbs} g target.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone attention">Tracked days</div>
          <p className="stat-label">Nutrition history</p>
          <h3>{totalDaysTracked}</h3>
          <p className="stat-change">Daily totals stay focused on the date you are viewing.</p>
        </article>
      </section>

      <section className="content-grid two-columns nutrition-layout">
        <Card
          title={editingEntryId ? "Edit meal entry" : "Meal logger"}
          subtitle="Use the viewed day by default, then reuse recent foods to cut down repeated typing."
        >
          <div className="workout-form">
            <div className="form-grid">
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setField("date", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Meal type</span>
                <select
                  value={form.mealType}
                  onChange={(event) =>
                    setField("mealType", event.target.value as MealType)
                  }
                >
                  {mealTypes.map((mealType) => (
                    <option key={mealType} value={mealType}>
                      {mealType}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field-wide">
                <span>Food name</span>
                <input
                  type="text"
                  placeholder="Greek yogurt bowl"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                />
              </label>

              <label className="field field-wide">
                <span>Quantity / serving</span>
                <input
                  type="text"
                  placeholder="250 g, 1 bowl, 2 scoops"
                  value={form.quantity}
                  onChange={(event) => setField("quantity", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Calories</span>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={form.calories}
                  onChange={(event) => setField("calories", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Protein (g)</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  value={form.protein}
                  onChange={(event) => setField("protein", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Carbs (g)</span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.5"
                  value={form.carbs}
                  onChange={(event) => setField("carbs", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Fats (g)</span>
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="0.5"
                  value={form.fats}
                  onChange={(event) => setField("fats", event.target.value)}
                />
              </label>
            </div>

            {recentFoodSuggestions.length > 0 ? (
              <div className="quick-picks">
                <p className="section-eyebrow">Recent foods</p>
                <div className="chip-row">
                  {recentFoodSuggestions.map((entry) => (
                    <button
                      key={`${entry.name}-${entry.mealType}-${entry.id}`}
                      type="button"
                      className="chip-button"
                      onClick={() => loadSuggestion(entry)}
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="category-callout nutrition-callout">
              <p className="section-eyebrow">Why it stays simple</p>
              <h4>Fast enough for every day</h4>
              <p>
                LiftIQ tracks the essentials first: meal type, serving info, calories,
                and macros. That keeps the workflow fast without pretending to be a giant
                food database.
              </p>
            </div>

            {validationErrors.length > 0 ? (
              <div className="alert-banner error">
                {validationErrors.map((entry) => (
                  <p key={entry}>{entry}</p>
                ))}
              </div>
            ) : null}

            {submitError ? (
              <div className="alert-banner error">
                <p>{submitError}</p>
              </div>
            ) : null}

            <div className="form-actions">
              <button
                type="button"
                className="button-link primary"
                onClick={() => void handleSaveEntry()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle size={16} className="spin" />
                ) : editingEntryId ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editingEntryId ? "Save meal" : "Add meal"}
              </button>

              <button
                type="button"
                className="button-link secondary"
                onClick={() => resetComposer()}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>

        <Card
          title="Daily totals"
          subtitle="Selected-day intake compared against a practical default target set."
        >
          <div className="compact-stack">
            <div className="input-with-icon">
              <CalendarDays size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <div className="metric-strip">
              <div className="metric-tile">
                <span>Calories</span>
                <strong>{daySummary.calories.toLocaleString()} kcal</strong>
              </div>
              <div className="metric-tile">
                <span>Protein</span>
                <strong>{daySummary.protein.toLocaleString()} g</strong>
              </div>
              <div className="metric-tile">
                <span>Carbs</span>
                <strong>{daySummary.carbs.toLocaleString()} g</strong>
              </div>
              <div className="metric-tile">
                <span>Fats</span>
                <strong>{daySummary.fats.toLocaleString()} g</strong>
              </div>
            </div>

            <div className="compact-stack">
              {macroProgress.map((metric) => (
                <article key={metric.key} className="nutrition-progress-row">
                  <div className="nutrition-progress-copy">
                    <div>
                      <h4>{metric.label}</h4>
                      <p>
                        {metric.current.toLocaleString()} / {metric.target.toLocaleString()}{" "}
                        {metric.unit}
                      </p>
                    </div>
                    <span className="meta-pill">
                      {metric.remaining >= 0
                        ? `${metric.remaining.toLocaleString()} ${metric.unit} left`
                        : `${Math.abs(metric.remaining).toLocaleString()} ${metric.unit} over`}
                    </span>
                  </div>
                  <div className="nutrition-progress-bar">
                    <div
                      className={`nutrition-progress-fill ${
                        metric.percentage >= 100 ? "complete" : ""
                      }`}
                      style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <Card
        title="Food log"
        subtitle="View the currently selected day, filter by meal type, and edit entries inline when something needs a correction."
      >
        <div className="history-toolbar">
          <label className="field search-field">
            <span>Search</span>
            <div className="input-with-icon">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search food names or serving details"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          <label className="field">
            <span>Meal type</span>
            <div className="input-with-icon">
              <Filter size={16} />
              <select
                value={mealTypeFilter}
                onChange={(event) =>
                  setMealTypeFilter(event.target.value as "All" | MealType)
                }
              >
                <option value="All">All meals</option>
                {mealTypes.map((mealType) => (
                  <option key={mealType} value={mealType}>
                    {mealType}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <div className="mini-note nutrition-target-note">
            <Flame size={18} />
            <p>
              Default targets: {defaultNutritionTargets.calories} kcal,{" "}
              {defaultNutritionTargets.protein} g protein,{" "}
              {defaultNutritionTargets.carbs} g carbs, {defaultNutritionTargets.fats} g fats.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <LoaderCircle size={18} className="spin" />
            <p>Loading nutrition log...</p>
          </div>
        ) : error ? (
          <div className="alert-banner error">
            <p>{error}</p>
            <div className="form-actions">
              <button
                type="button"
                className="button-link secondary"
                onClick={() => void reload()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : entriesForLog.length === 0 ? (
          <EmptyState
            title={
              entries.length === 0
                ? "No meals logged yet"
                : "No meals match the current day or filters"
            }
            description={
              entries.length === 0
                ? "Add your first food entry and the daily totals plus target comparisons will update immediately."
                : "Try another date, meal type, or search term to widen the food log."
            }
          />
        ) : (
          <div className="stack-list workout-history top-space">
            {entriesForLog.map((entry) => (
              <article key={entry.id} className="workout-entry nutrition-entry">
                <div className="workout-entry-header">
                  <div>
                    <h4>{entry.name}</h4>
                    <p>{buildEntryLabel(entry)}</p>
                  </div>
                  <span className="meta-pill">{entry.calories.toLocaleString()} kcal</span>
                </div>

                <div className="metric-strip">
                  <div className="metric-tile">
                    <span>Protein</span>
                    <strong>{entry.protein.toLocaleString()} g</strong>
                  </div>
                  <div className="metric-tile">
                    <span>Carbs</span>
                    <strong>{entry.carbs.toLocaleString()} g</strong>
                  </div>
                  <div className="metric-tile">
                    <span>Fats</span>
                    <strong>{entry.fats.toLocaleString()} g</strong>
                  </div>
                </div>

                <div className="entry-actions">
                  <button
                    type="button"
                    className="inline-action"
                    onClick={() => startEditingEntry(entry)}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-action danger"
                    onClick={() => void handleDeleteEntry(entry)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <section className="content-grid three-columns">
        <Card title="Meal balance">
          <div className="mini-note">
            <Apple size={18} />
            <p>
              Meals are grouped by day and meal type so you can log quickly without
              scrolling through a dense spreadsheet.
            </p>
          </div>
        </Card>

        <Card title="Macro clarity">
          <div className="mini-note">
            <Beef size={18} />
            <p>
              Protein, carbs, and fats are always visible beside calories so the log
              works for both body-composition goals and general consistency.
            </p>
          </div>
        </Card>

        <Card title="Targets in context">
          <div className="mini-note">
            <Wheat size={18} />
            <p>
              The target comparison stays simple on purpose: a practical default set
              now, with more personalized profile controls available for later phases.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
