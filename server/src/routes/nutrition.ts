import { Router } from "express";
import {
  createNutritionEntry,
  deleteNutritionEntry,
  listNutritionEntries,
  updateNutritionEntry
} from "../lib/nutritionStore.js";
import { validateNutritionPayload } from "../lib/nutritionValidation.js";

export const nutritionRouter = Router();

nutritionRouter.get("/", (_request, response) => {
  response.json({
    entries: listNutritionEntries()
  });
});

nutritionRouter.post("/", (request, response) => {
  const result = validateNutritionPayload(request.body);

  if (!result.data) {
    response.status(400).json({
      errors: result.errors ?? ["Nutrition payload is invalid."]
    });
    return;
  }

  const entry = createNutritionEntry(result.data);

  response.status(201).json({ entry });
});

nutritionRouter.put("/:id", (request, response) => {
  const result = validateNutritionPayload(request.body);

  if (!result.data) {
    response.status(400).json({
      errors: result.errors ?? ["Nutrition payload is invalid."]
    });
    return;
  }

  const entry = updateNutritionEntry(request.params.id, result.data);

  if (!entry) {
    response.status(404).json({
      errors: ["Nutrition entry not found."]
    });
    return;
  }

  response.json({ entry });
});

nutritionRouter.delete("/:id", (request, response) => {
  const removed = deleteNutritionEntry(request.params.id);

  if (!removed) {
    response.status(404).json({
      errors: ["Nutrition entry not found."]
    });
    return;
  }

  response.status(204).send();
});
