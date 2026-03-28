import { Router } from "express";
import { config } from "../config.js";
export const healthRouter = Router();
healthRouter.get("/", (_request, response) => {
    response.json({
        status: "ok",
        app: config.appName,
        timestamp: new Date().toISOString()
    });
});
