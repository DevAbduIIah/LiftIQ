import { Router } from "express";
import { createWorkout, deleteWorkout, listWorkouts, updateWorkout } from "../lib/workoutStore.js";
import { validateWorkoutPayload } from "../lib/workoutValidation.js";
export const workoutsRouter = Router();
workoutsRouter.get("/", (_request, response) => {
    response.json({
        workouts: listWorkouts()
    });
});
workoutsRouter.post("/", (request, response) => {
    const result = validateWorkoutPayload(request.body);
    if (!result.data) {
        response.status(400).json({
            errors: result.errors ?? ["Workout payload is invalid."]
        });
        return;
    }
    const workout = createWorkout(result.data);
    response.status(201).json({ workout });
});
workoutsRouter.put("/:id", (request, response) => {
    const result = validateWorkoutPayload(request.body);
    if (!result.data) {
        response.status(400).json({
            errors: result.errors ?? ["Workout payload is invalid."]
        });
        return;
    }
    const workout = updateWorkout(request.params.id, result.data);
    if (!workout) {
        response.status(404).json({
            errors: ["Workout not found."]
        });
        return;
    }
    response.json({ workout });
});
workoutsRouter.delete("/:id", (request, response) => {
    const removed = deleteWorkout(request.params.id);
    if (!removed) {
        response.status(404).json({
            errors: ["Workout not found."]
        });
        return;
    }
    response.status(204).send();
});
