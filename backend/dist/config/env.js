"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(5000),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:3000"),
    MARKET_API_BASE_URL: zod_1.z.string().default(""),
    MARKET_API_KEY: zod_1.z.string().default(""),
    CACHE_TTL_COMPANY: zod_1.z.coerce.number().default(1800),
    CACHE_TTL_CHART: zod_1.z.coerce.number().default(43200),
    CACHE_TTL_FORECAST: zod_1.z.coerce.number().default(86400),
    CACHE_TTL_SEARCH: zod_1.z.coerce.number().default(86400),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(60_000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().default(100),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables:", zod_1.z.treeifyError(parsed.error));
    process.exit(1);
}
exports.env = {
    ...parsed.data,
    corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim()),
    isProd: parsed.data.NODE_ENV === "production",
};
//# sourceMappingURL=env.js.map