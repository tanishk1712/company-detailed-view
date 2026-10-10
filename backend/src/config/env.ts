import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  MARKET_API_BASE_URL: z.string().default(""),
  MARKET_API_KEY: z.string().default(""),
  CACHE_TTL_COMPANY: z.coerce.number().default(1800),
  CACHE_TTL_CHART: z.coerce.number().default(43200),
  CACHE_TTL_FORECAST: z.coerce.number().default(86400),
  CACHE_TTL_SEARCH: z.coerce.number().default(86400),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim()),
  isProd: parsed.data.NODE_ENV === "production",
};
