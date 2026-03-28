import {
  ArrowDownUp,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Filter,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Tags,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { categoryDescriptions, exercisePresets } from "../data/exercises";
import { useWorkouts } from "../hooks/useWorkouts";
import type { ExerciseCategory, Workout, WorkoutPayload } from "../types/workout";
import { exerciseCategories } from "../types/workout";

type SortOption =
  | "newest"
  | "oldest"
  | "heaviest"
  | "highest-volume"
  | "exercise-a-z";

interface FormState {
  date: string;
  category: ExerciseCategory;
  exerciseName: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

interface DraftEntry {
  id: string;
  payload: WorkoutPayload;
}

const defaultCategory: ExerciseCategory = "Full Body";

function createDefaultFormState(
  overrides: Partial<FormState> = {}
): FormState {
  return {
    date: new Date().toISOString().slice(0, 10),
    category: defaultCategory,
    exerciseName: "",
    sets: "3",
    reps: "8",
    weight: "0",
    notes: "",
    ...overrides
  };
}

function validateForm(form: FormState) {
  const errors: string[] = [];
  const exerciseName = form.exerciseName.trim();
  const sets = Number(form.sets);
  const reps = Number(form.reps);
  const weight = Number(form.weight);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
    errors.push("Choose a valid workout date.");
  }

  if (!exerciseCategories.includes(form.category)) {
    errors.push("Choose a valid exercise category.");
  }

  if (exerciseName.length < 2) {
    errors.push("Exercise name must be at least 2 characters.");
  }

  if (!Number.isInteger(sets) || sets < 1 || sets > 20) {
    errors.push("Sets must be a whole number between 1 and 20.");
  }

  if (!Number.isInteger(reps) || reps < 1 || reps > 100) {
    errors.push("Reps must be a whole number between 1 and 100.");
  }

  if (!Number.isFinite(weight) || weight < 0 || weight > 2000) {
    errors.push("Weight must be between 0 and 2000.");
  }

  if (form.notes.trim().length > 500) {
    errors.push("Notes must be 500 characters or fewer.");
  }

  return errors;
}

function toPayload(form: FormState): WorkoutPayload {
  return {
    date: form.date,
    category: form.category,
    exerciseName: form.exerciseName.trim(),
    sets: Number(form.sets),
    reps: Number(form.reps),
    weight: Number(form.weight),
    notes: form.notes.trim()
  };
}

function formatWorkoutDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getWorkoutVolume(workout: Pick<WorkoutPayload, "sets" | "reps" | "weight">) {
  return workout.sets * workout.reps * workout.weight;
}

function buildSimilarFormState(payload: WorkoutPayload): FormState {
  return {
    date: payload.date,
    category: payload.category,
    exerciseName: payload.exerciseName,
    sets: String(payload.sets),
    reps: String(payload.reps),
    weight: String(payload.weight),
    notes: ""
  };
}

export function WorkoutsPage() {
  const {
    workouts,
    isLoading,
    error,
    reload,
    createEntry,
    createManyEntries,
    updateEntry,
    deleteEntry
  } = useWorkouts();
  const [form, setForm] = useState<FormState>(createDefaultFormState);
  const [draftEntries, setDraftEntries] = useState<DraftEntry[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingSavedId, setEditingSavedId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | ExerciseCategory>(
    "All"
  );
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const activeCategoryPresets = exercisePresets[form.category];
  const recentExercises = workouts
    .filter((workout) => workout.category === form.category)
    .map((workout) => workout.exerciseName)
    .filter((exerciseName, index, array) => array.indexOf(exerciseName) === index)
    .slice(0, 5);
  const totalVolume = workouts.reduce(
    (sum, workout) => sum + getWorkoutVolume(workout),
    0
  );
  const categoryCounts = exerciseCategories.map((category) => ({
    category,
    count: workouts.filter((workout) => workout.category === category).length
  }));
  const uniqueExerciseCount = new Set(
    workouts.map((workout) => `${workout.category}:${workout.exerciseName}`)
  ).size;
  const filteredWorkouts = workouts
    .filter((workout) => {
      const matchesCategory =
        categoryFilter === "All" || workout.category === categoryFilter;
      const searchValue = searchTerm.trim().toLowerCase();
      const matchesSearch =
        searchValue.length === 0 ||
        workout.exerciseName.toLowerCase().includes(searchValue) ||
        workout.category.toLowerCase().includes(searchValue) ||
        workout.notes.toLowerCase().includes(searchValue);

      return matchesCategory && matchesSearch;
    })
    .sort((left, right) => {
      if (sortOption === "oldest") {
        if (left.date !== right.date) {
          return left.date.localeCompare(right.date);
        }

        return left.updatedAt.localeCompare(right.updatedAt);
      }

      if (sortOption === "heaviest") {
        return right.weight - left.weight;
      }

      if (sortOption === "highest-volume") {
        return getWorkoutVolume(right) - getWorkoutVolume(left);
      }

      if (sortOption === "exercise-a-z") {
        return left.exerciseName.localeCompare(right.exerciseName);
      }

      if (left.date !== right.date) {
        return right.date.localeCompare(left.date);
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function resetComposer(preserveCategoryAndDate = true) {
    setForm(
      createDefaultFormState(
        preserveCategoryAndDate
          ? {
              date: form.date,
              category: form.category
            }
          : undefined
      )
    );
    setEditingDraftId(null);
    setEditingSavedId(null);
    setValidationErrors([]);
    setSubmitError(null);
  }

  function loadDraftIntoComposer(entry: DraftEntry) {
    setEditingDraftId(entry.id);
    setEditingSavedId(null);
    setValidationErrors([]);
    setSubmitError(null);
    setForm({
      date: entry.payload.date,
      category: entry.payload.category,
      exerciseName: entry.payload.exerciseName,
      sets: String(entry.payload.sets),
      reps: String(entry.payload.reps),
      weight: String(entry.payload.weight),
      notes: entry.payload.notes
    });
  }

  function startEditingSavedWorkout(workout: Workout) {
    setEditingSavedId(workout.id);
    setEditingDraftId(null);
    setValidationErrors([]);
    setSubmitError(null);
    setForm({
      date: workout.date,
      category: workout.category,
      exerciseName: workout.exerciseName,
      sets: String(workout.sets),
      reps: String(workout.reps),
      weight: String(workout.weight),
      notes: workout.notes
    });
  }

  function upsertDraftEntry(keepSimilar: boolean) {
    const errors = validateForm(form);
    setValidationErrors(errors);
    setSubmitError(null);

    if (errors.length > 0) {
      return;
    }

    const payload = toPayload(form);

    if (editingDraftId) {
      setDraftEntries((current) =>
        current.map((entry) =>
          entry.id === editingDraftId ? { ...entry, payload } : entry
        )
      );
    } else {
      setDraftEntries((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          payload
        }
      ]);
    }

    if (keepSimilar) {
      setForm(buildSimilarFormState(payload));
      setEditingDraftId(null);
      setEditingSavedId(null);
      setValidationErrors([]);
      return;
    }

    resetComposer(true);
  }

  async function handleSaveCurrentNow() {
    const errors = validateForm(form);
    setValidationErrors(errors);
    setSubmitError(null);

    if (errors.length > 0) {
      return;
    }

    const payload = toPayload(form);

    try {
      setIsSubmitting(true);

      if (editingSavedId) {
        await updateEntry(editingSavedId, payload);
      } else {
        await createEntry(payload);
      }

      resetComposer(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to save workout."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveSession() {
    if (draftEntries.length === 0) {
      setSubmitError("Add at least one draft entry before saving a session.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await createManyEntries(draftEntries.map((entry) => entry.payload));
      setDraftEntries([]);
      resetComposer(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to save workout session."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteWorkout(workout: Workout) {
    const confirmed = window.confirm(
      `Delete ${workout.exerciseName} from ${formatWorkoutDate(workout.date)}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEntry(workout.id);

      if (editingSavedId === workout.id) {
        resetComposer(true);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to delete workout."
      );
    }
  }

  function removeDraftEntry(entry: DraftEntry) {
    setDraftEntries((current) => current.filter((draft) => draft.id !== entry.id));

    if (editingDraftId === entry.id) {
      resetComposer(true);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Workouts"
        title="Structured logging for real training weeks"
        description="Organize exercises by category, build a session with multiple entries before saving, and browse history with search, filters, and practical sorting."
      />

      <section className="stats-grid workout-summary-grid">
        <article className="stat-card">
          <div className="stat-tone neutral">Logged entries</div>
          <p className="stat-label">Workout history</p>
          <h3>{workouts.length}</h3>
          <p className="stat-change">Single lifts and full sessions both land here.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone neutral">Unique exercises</div>
          <p className="stat-label">Movement variety</p>
          <h3>{uniqueExerciseCount}</h3>
          <p className="stat-change">Grouped by category and exercise name.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone neutral">Total volume</div>
          <p className="stat-label">Tracked load</p>
          <h3>{totalVolume.toLocaleString()} kg</h3>
          <p className="stat-change">Useful baseline while analytics are still ahead.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone attention">Draft session</div>
          <p className="stat-label">Queued entries</p>
          <h3>{draftEntries.length}</h3>
          <p className="stat-change">Build a session first, then save it in one sweep.</p>
        </article>
      </section>

      <section className="content-grid two-columns workout-layout">
        <Card
          title={
            editingSavedId
              ? "Edit saved workout"
              : editingDraftId
                ? "Edit draft entry"
                : "Workout composer"
          }
          subtitle="Choose a category first, then use presets and recent exercises to reduce typing."
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
                <span>Category</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setField("category", event.target.value as ExerciseCategory)
                  }
                >
                  {exerciseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field-wide">
                <span>Exercise name</span>
                <input
                  type="text"
                  placeholder="Barbell bench press"
                  value={form.exerciseName}
                  onChange={(event) => setField("exerciseName", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Sets</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.sets}
                  onChange={(event) => setField("sets", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Reps</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.reps}
                  onChange={(event) => setField("reps", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Weight (kg)</span>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  step="0.5"
                  value={form.weight}
                  onChange={(event) => setField("weight", event.target.value)}
                />
              </label>

              <label className="field field-wide">
                <span>Notes</span>
                <textarea
                  rows={4}
                  placeholder="Optional cues, tempo notes, effort, or how the lift felt."
                  value={form.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                />
              </label>
            </div>

            <div className="category-callout">
              <p className="section-eyebrow">Current category</p>
              <h4>{form.category}</h4>
              <p>{categoryDescriptions[form.category]}</p>
            </div>

            <div className="quick-picks">
              <p className="section-eyebrow">Preset exercises</p>
              <div className="chip-row">
                {activeCategoryPresets.map((exerciseName) => (
                  <button
                    key={exerciseName}
                    type="button"
                    className="chip-button"
                    onClick={() => setField("exerciseName", exerciseName)}
                  >
                    {exerciseName}
                  </button>
                ))}
              </div>
            </div>

            {recentExercises.length > 0 ? (
              <div className="quick-picks">
                <p className="section-eyebrow">Recent in this category</p>
                <div className="chip-row">
                  {recentExercises.map((exerciseName) => (
                    <button
                      key={exerciseName}
                      type="button"
                      className="chip-button"
                      onClick={() => setField("exerciseName", exerciseName)}
                    >
                      {exerciseName}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

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
                onClick={() => void handleSaveCurrentNow()}
                disabled={isSubmitting}
              >
                {isSubmitting && editingSavedId ? (
                  <LoaderCircle size={16} className="spin" />
                ) : editingSavedId ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editingSavedId ? "Save workout" : "Save current now"}
              </button>

              {!editingSavedId ? (
                <>
                  <button
                    type="button"
                    className="button-link secondary"
                    onClick={() => upsertDraftEntry(false)}
                    disabled={isSubmitting}
                  >
                    <FolderKanban size={16} />
                    {editingDraftId ? "Update draft" : "Add to session"}
                  </button>

                  <button
                    type="button"
                    className="button-link secondary"
                    onClick={() => upsertDraftEntry(true)}
                    disabled={isSubmitting}
                  >
                    <Dumbbell size={16} />
                    {editingDraftId ? "Update & keep similar" : "Add & keep similar"}
                  </button>
                </>
              ) : null}

              <button
                type="button"
                className="button-link secondary"
                onClick={() => resetComposer(true)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>

        <Card
          title="Session builder"
          subtitle="Queue multiple entries naturally, then save the full session when you are done."
        >
          {draftEntries.length === 0 ? (
            <EmptyState
              title="No draft entries yet"
              description="Use Add to session as you move through exercises, then save the whole workout block once the session is complete."
            />
          ) : (
            <div className="stack-list workout-history">
              {draftEntries.map((entry, index) => (
                <article key={entry.id} className="workout-entry">
                  <div className="workout-entry-header">
                    <div>
                      <h4>
                        {index + 1}. {entry.payload.exerciseName}
                      </h4>
                      <p>
                        {entry.payload.category} · {formatWorkoutDate(entry.payload.date)}
                      </p>
                    </div>
                    <span className="meta-pill">
                      {getWorkoutVolume(entry.payload).toLocaleString()} kg volume
                    </span>
                  </div>

                  <div className="metric-strip">
                    <div className="metric-tile">
                      <span>Sets</span>
                      <strong>{entry.payload.sets}</strong>
                    </div>
                    <div className="metric-tile">
                      <span>Reps</span>
                      <strong>{entry.payload.reps}</strong>
                    </div>
                    <div className="metric-tile">
                      <span>Weight</span>
                      <strong>{entry.payload.weight} kg</strong>
                    </div>
                  </div>

                  {entry.payload.notes ? (
                    <p className="workout-notes">{entry.payload.notes}</p>
                  ) : null}

                  <div className="entry-actions">
                    <button
                      type="button"
                      className="inline-action"
                      onClick={() => loadDraftIntoComposer(entry)}
                    >
                      <Pencil size={16} />
                      Edit draft
                    </button>
                    <button
                      type="button"
                      className="inline-action danger"
                      onClick={() => removeDraftEntry(entry)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="form-actions top-space">
            <button
              type="button"
              className="button-link primary"
              onClick={() => void handleSaveSession()}
              disabled={isSubmitting || draftEntries.length === 0}
            >
              {isSubmitting ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Save size={16} />
              )}
              Save full session
            </button>

            <button
              type="button"
              className="button-link secondary"
              onClick={() => setDraftEntries([])}
              disabled={isSubmitting || draftEntries.length === 0}
            >
              Clear draft
            </button>
          </div>
        </Card>
      </section>

      <Card
        title="Workout history"
        subtitle="Search across exercises, categories, and notes, then sort by the view that fits the question you are asking."
      >
        <div className="history-toolbar">
          <label className="field search-field">
            <span>Search</span>
            <div className="input-with-icon">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search exercises, categories, or notes"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          <label className="field">
            <span>Category filter</span>
            <div className="input-with-icon">
              <Filter size={16} />
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as "All" | ExerciseCategory)
                }
              >
                <option value="All">All categories</option>
                {exerciseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="field">
            <span>Sort by</span>
            <div className="input-with-icon">
              <ArrowDownUp size={16} />
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="heaviest">Heaviest weight</option>
                <option value="highest-volume">Highest volume</option>
                <option value="exercise-a-z">Exercise A-Z</option>
              </select>
            </div>
          </label>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <LoaderCircle size={18} className="spin" />
            <p>Loading workouts...</p>
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
        ) : filteredWorkouts.length === 0 ? (
          <EmptyState
            title={
              workouts.length === 0
                ? "No workouts saved yet"
                : "No workouts match the current filters"
            }
            description={
              workouts.length === 0
                ? "Save your first workout or build a session draft to begin filling out the training timeline."
                : "Try another search term, category filter, or sort option to widen the history view."
            }
          />
        ) : (
          <div className="stack-list workout-history top-space">
            {filteredWorkouts.map((workout) => (
              <article key={workout.id} className="workout-entry">
                <div className="workout-entry-header">
                  <div>
                    <h4>{workout.exerciseName}</h4>
                    <p>
                      {formatWorkoutDate(workout.date)} · {workout.category}
                    </p>
                  </div>
                  <span className="meta-pill">
                    {getWorkoutVolume(workout).toLocaleString()} kg volume
                  </span>
                </div>

                <div className="metric-strip">
                  <div className="metric-tile">
                    <span>Sets</span>
                    <strong>{workout.sets}</strong>
                  </div>
                  <div className="metric-tile">
                    <span>Reps</span>
                    <strong>{workout.reps}</strong>
                  </div>
                  <div className="metric-tile">
                    <span>Weight</span>
                    <strong>{workout.weight} kg</strong>
                  </div>
                </div>

                {workout.notes ? (
                  <p className="workout-notes">{workout.notes}</p>
                ) : null}

                <div className="entry-actions">
                  <button
                    type="button"
                    className="inline-action"
                    onClick={() => startEditingSavedWorkout(workout)}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-action danger"
                    onClick={() => void handleDeleteWorkout(workout)}
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
        <Card title="Exercise organization">
          <div className="mini-note">
            <Tags size={18} />
            <p>
              Every workout now belongs to a category so the history is easier to
              scan and future analytics can reason about muscle-group balance.
            </p>
          </div>
        </Card>

        <Card title="Category coverage">
          <div className="stack-list compact-stack">
            {categoryCounts.map((entry) => (
              <div key={entry.category} className="coverage-row">
                <span>{entry.category}</span>
                <strong>{entry.count}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card title="History controls">
          <div className="mini-note">
            <ClipboardList size={18} />
            <p>
              Search by name, category, or notes, then swap between newest,
              oldest, heaviest, highest-volume, and alphabetical views.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
