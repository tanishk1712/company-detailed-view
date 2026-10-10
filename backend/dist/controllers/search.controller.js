"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchHandler = searchHandler;
const search_service_1 = require("../services/search.service");
const httpError_1 = require("../utils/httpError");
async function searchHandler(req, res) {
    const q = String(req.query.q ?? "").trim();
    if (q.length < 2)
        throw httpError_1.HttpError.badRequest("Query must be at least 2 characters");
    if (q.length > 60)
        throw httpError_1.HttpError.badRequest("Query is too long");
    const result = await (0, search_service_1.searchCompanies)(q);
    res.json({ success: true, data: result.value });
}
//# sourceMappingURL=search.controller.js.map