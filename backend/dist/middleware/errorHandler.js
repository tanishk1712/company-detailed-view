"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const httpError_1 = require("../utils/httpError");
const env_1 = require("../config/env");
const notFoundHandler = (req, _res, next) => {
    next(httpError_1.HttpError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, _req, res, _next) => {
    const status = err instanceof httpError_1.HttpError ? err.status : 500;
    const code = err instanceof httpError_1.HttpError ? err.code : "INTERNAL_ERROR";
    const message = err instanceof httpError_1.HttpError || !env_1.env.isProd ? err.message : "Something went wrong";
    if (status >= 500)
        console.error(err);
    res.status(status).json({ success: false, error: { code, message } });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map