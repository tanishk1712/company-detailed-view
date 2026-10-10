"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    status;
    code;
    constructor(status, message, code = "ERROR") {
        super(message);
        this.status = status;
        this.code = code;
        this.name = "HttpError";
    }
    static badRequest(message) {
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
exports.HttpError = HttpError;
//# sourceMappingURL=httpError.js.map