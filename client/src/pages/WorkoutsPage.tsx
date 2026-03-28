import {
  CalendarDays,
  ClipboardList,
  Dumbbell,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useWorkouts } from "../hooks/useWorkouts";
import type { Workout, WorkoutPayload } from "../types/workout";

interface FormState {
  date: string;
  exerciseName: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

const createDefaultFormState = (): FormState => ({
  date: new Date().toISOString().slice(0, 10),
  exerciseName: "",
  sets: "3",
  reps: "8",
  weight: "0",
  notes: ""
});

function validateForm(form: FormState) {
  const errors: string[] = [];
  const exerciseName = form.exerciseName.trim();
  const sets = Number(form.sets);
  const reps = Number(form.reps);
  const weight = Number(form.weight);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
    errors.push("Choose a valid workout date.");
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

export function WorkoutsPage() {
  const { workouts, isLoading, error, createEntry, updateEntry, deleteEntry } =
    useWorkouts();
  const [form, setForm] = useState<FormState>(createDefaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"default" | "similar">("default");

  const recentExercises = workouts
    .map((workout) => workout.exerciseName)
    .filter((exerciseName, index, array) => array.indexOf(exerciseName) === index)
    .slice(0, 5);
  const totalVolume = workouts.reduce(
    (sum, workout) => sum + workout.sets * workout.reps * workout.weight,
    0
  );
  const totalSets = workouts.reduce((sum, workout) => sum + workout.sets, 0);
  const lastWorkout = workouts[0];

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function resetComposer() {
    setForm(createDefaultFormState());
    setEditingId(null);
    setValidationErrors([]);
    setSubmitError(null);
    setSubmitMode("default");
  }

  function startEditing(workout: Workout) {
    setEditingId(workout.id);
    setValidationErrors([]);
    setSubmitError(null);
    setForm({
      date: workout.date,
      exerciseName: workout.exerciseName,
      sets: String(workout.sets),
      reps: String(workout.reps),
      weight: String(workout.weight),
      notes: workout.notes
    });
  }

  async function handleSubmit(mode: "default" | "similar") {
    const errors = validateForm(form);

    setValidationErrors(errors);
    setSubmitError(null);

    if (errors.length > 0) {
      return;
    }

    const payload = toPayload(form);

    try {
      setIsSubmitting(true);
      setSubmitMode(mode);

      if (editingId) {
        await updateEntry(editingId, payload);
        resetComposer();
        return;
      }

      await createEntry(payload);

      if (mode === "similar") {
        setForm({
          date: payload.date,
          exerciseName: payload.exerciseName,
          sets: String(payload.sets),
          reps: String(payload.reps),
          weight: String(payload.weight),
          notes: ""
        });
        setValidationErrors([]);
        setSubmitError(null);
      } else {
        resetComposer();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to save workout."
      );
    } finally {
      setIsSubmitting(false);
      setSubmitMode("default");
    }
  }

  async function handleDelete(workout: Workout) {
    const confirmed = window.confirm(
      `Delete ${workout.exerciseName} from ${formatWorkoutDate(workout.date)}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEntry(workout.id);

      if (editingId === workout.id) {
        resetComposer();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to delete workout."
      );
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Workouts"
        title="Log sessions without friction"
        description="Track your lifts with a fast single-session flow, edit entries when plans change, and reuse your last setup when you are moving through similar sets."
      />

      <section className="stats-grid workout-summary-grid">
        <article className="stat-card">
          <div className="stat-tone neutral">Logged entries</div>
          <p className="stat-label">Workout history</p>
          <h3>{workouts.length}</h3>
          <p className="stat-change">Every saved entry appears instantly in history.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone neutral">Total volume</div>
          <p className="stat-label">Tracked load</p>
          <h3>{totalVolume.toLocaleString()} kg</h3>
          <p className="stat-change">Calculated from sets x reps x weight.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone neutral">Total sets</div>
          <p className="stat-label">Work completed</p>
          <h3>{totalSets}</h3>
          <p className="stat-change">Useful baseline before analytics land in Phase 4.</p>
        </article>
        <article className="stat-card">
          <div className="stat-tone attention">Latest entry</div>
          <p className="stat-label">Most recent lift</p>
          <h3>{lastWorkout ? lastWorkout.exerciseName : "None yet"}</h3>
          <p className="stat-change">
            {lastWorkout
              ? formatWorkoutDate(lastWorkout.date)
              : "Log your first session to start building history."}
          </p>
        </article>
      </section>

      <section className="content-grid two-columns workout-layout">
        <Card
          title={editingId ? "Edit workout" : "Workout logger"}
          subtitle={
            editingId
              ? "Update the selected workout entry and save your changes."
              : "Save one lift at a time, or keep the same structure and log a similar set quickly."
          }
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

              <label className="field field-wide">
                <span>Exercise name</span>
                <input
                  type="text"
                  placeholder="Barbell back squat"
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
                  placeholder="Optional cues, intensity notes, or how the lift felt."
                  value={form.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                />
              </label>
            </div>

            {recentExercises.length > 0 ? (
              <div className="quick-picks">
                <p className="section-eyebrow">Recent exercises</p>
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
                onClick={() => void handleSubmit("default")}
                disabled={isSubmitting}
              >
                {isSubmitting && submitMode === "default" ? (
                  <LoaderCircle size={16} className="spin" />
                ) : editingId ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editingId ? "Save changes" : "Save workout"}
              </button>

              {!editingId ? (
                <button
                  type="button"
                  className="button-link secondary"
                  onClick={() => void handleSubmit("similar")}
                  disabled={isSubmitting}
                >
                  {isSubmitting && submitMode === "similar" ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <Dumbbell size={16} />
                  )}
                  Save & log similar
                </button>
              ) : null}

              <button
                type="button"
                className="button-link secondary"
                onClick={resetComposer}
                disabled={isSubmitting}
              >
                <RotateCcw size={16} />
                {editingId ? "Cancel edit" : "Reset form"}
              </button>
            </div>
          </div>
        </Card>

        <Card
          title="Workout history"
          subtitle="Your latest entries stay sorted to the top so repeated logging stays quick."
        >
          {isLoading ? (
            <div className="loading-state">
              <LoaderCircle size={18} className="spin" />
              <p>Loading workouts...</p>
            </div>
          ) : error ? (
            <div className="alert-banner error">
              <p>{error}</p>
            </div>
          ) : workouts.length === 0 ? (
            <EmptyState
              title="No workouts logged yet"
              description="Your history will appear here as soon as you save your first entry."
            />
          ) : (
            <div className="stack-list workout-history">
              {workouts.map((workout) => {
                const volume = workout.sets * workout.reps * workout.weight;

                return (
                  <article key={workout.id} className="workout-entry">
                    <div className="workout-entry-header">
                      <div>
                        <h4>{workout.exerciseName}</h4>
                        <p>{formatWorkoutDate(workout.date)}</p>
                      </div>
                      <span className="meta-pill">{volume.toLocaleString()} kg volume</span>
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
                        onClick={() => startEditing(workout)}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-action danger"
                        onClick={() => void handleDelete(workout)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      <section className="content-grid three-columns">
        <Card title="Repeated logging flow">
          <div className="mini-note">
            <Dumbbell size={18} />
            <p>
              Use <strong>Save & log similar</strong> to keep the exercise, sets,
              reps, and weight while clearing notes for the next entry.
            </p>
          </div>
        </Card>

        <Card title="Editing without friction">
          <div className="mini-note">
            <ClipboardList size={18} />
            <p>
              Tap any history item to load it back into the form, then save the
              corrected entry in place.
            </p>
          </div>
        </Card>

        <Card title="Built for timeline review">
          <div className="mini-note">
            <CalendarDays size={18} />
            <p>
              History is sorted by workout date and most recent updates so your
              latest training stays visible first.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
