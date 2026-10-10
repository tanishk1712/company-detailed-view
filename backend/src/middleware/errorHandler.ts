import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import { env } from "../config/env";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  const code = err instanceof HttpError ? err.code : "INTERNAL_ERROR";
  const message = err instanceof HttpError || !env.isProd ? err.message : "Something went wrong";

  if (status >= 500) console.error(err);

  res.status(status).json({ success: false, error: { code, message } });
};
