import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
  app.use(compression());
  app.use(express.json());
  app.use(morgan(env.isProd ? "combined" : "dev"));

  app.use("/api", apiRateLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
