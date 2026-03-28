import { exerciseCategories } from "../types/workout.js";
function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}
function parseInteger(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : Number.NaN;
}
function parseNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}
export function validateWorkoutPayload(input) {
    if (!input || typeof input !== "object") {
        return {
            errors: ["Workout payload is required."]
        };
    }
    const candidate = input;
    const date = String(candidate.date ?? "").trim();
    const category = String(candidate.category ?? "").trim();
    const exerciseName = String(candidate.exerciseName ?? "").trim();
    const sets = parseInteger(candidate.sets);
    const reps = parseInteger(candidate.reps);
    const weight = parseNumber(candidate.weight);
    const notes = String(candidate.notes ?? "").trim();
    const errors = [];
    if (!isValidDate(date)) {
        errors.push("Date must use the YYYY-MM-DD format.");
    }
    if (exerciseName.length < 2) {
        errors.push("Exercise name must be at least 2 characters.");
    }
    if (!exerciseCategories.includes(category)) {
        errors.push("Choose a valid exercise category.");
    }
    if (exerciseName.length > 80) {
        errors.push("Exercise name must be 80 characters or fewer.");
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
    if (notes.length > 500) {
        errors.push("Notes must be 500 characters or fewer.");
    }
    if (errors.length > 0) {
        return { errors };
    }
    return {
        data: {
            date,
            category: category,
            exerciseName,
            sets,
            reps,
            weight,
            notes
        }
    };
}
