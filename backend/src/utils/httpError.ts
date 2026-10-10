export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "ERROR",
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string) {
    return new HttpError(400, message, "BAD_REQUEST");
  }

  static notFound(message = "Resource not found") {
    return new HttpError(404, message, "NOT_FOUND");
  }

  static upstream(message = "Market data provider is unavailable") {
    return new HttpError(502, message, "UPSTREAM_ERROR");
  }

  static quotaExceeded(message = "Market data provider quota exhausted. Please try again later.") {
    return new HttpError(503, message, "QUOTA_EXCEEDED");
  }
}
