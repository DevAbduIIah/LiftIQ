import crypto from "node:crypto";
const workouts = [];
function sortWorkouts(entries) {
    return [...entries].sort((left, right) => {
        if (left.date !== right.date) {
            return right.date.localeCompare(left.date);
        }
        return right.updatedAt.localeCompare(left.updatedAt);
    });
}
export function listWorkouts() {
    return sortWorkouts(workouts);
}
export function createWorkout(payload) {
    const timestamp = new Date().toISOString();
    const workout = {
        id: crypto.randomUUID(),
        date: payload.date,
        exerciseName: payload.exerciseName,
        sets: payload.sets,
        reps: payload.reps,
        weight: payload.weight,
        notes: payload.notes ?? "",
        createdAt: timestamp,
        updatedAt: timestamp
    };
    workouts.push(workout);
    return workout;
}
export function updateWorkout(id, payload) {
    const workout = workouts.find((entry) => entry.id === id);
    if (!workout) {
        return null;
    }
    workout.date = payload.date;
    workout.exerciseName = payload.exerciseName;
    workout.sets = payload.sets;
    workout.reps = payload.reps;
    workout.weight = payload.weight;
    workout.notes = payload.notes ?? "";
    workout.updatedAt = new Date().toISOString();
    return workout;
}
export function deleteWorkout(id) {
    const index = workouts.findIndex((entry) => entry.id === id);
    if (index === -1) {
        return false;
    }
    workouts.splice(index, 1);
    return true;
}
