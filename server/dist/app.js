import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { workoutsRouter } from "./routes/workouts.js";
export function createApp() {
    const app = express();
    app.use(cors({
        origin: config.clientOrigin
    }));
    app.use(express.json());
    app.get("/", (_request, response) => {
        response.json({
            app: config.appName,
            message: "LiftIQ backend is running."
        });
    });
    app.use("/api/health", healthRouter);
    app.use("/api/workouts", workoutsRouter);
    return app;
}
