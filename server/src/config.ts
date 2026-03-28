import dotenv from "dotenv";

dotenv.config();

export const config = {
  appName: "LiftIQ API",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  port: Number(process.env.PORT ?? 4000)
} as const;
