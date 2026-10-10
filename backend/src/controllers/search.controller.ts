import type { Request, Response } from "express";
import { searchCompanies } from "../services/search.service";
import { HttpError } from "../utils/httpError";

export async function searchHandler(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) throw HttpError.badRequest("Query must be at least 2 characters");
  if (q.length > 60) throw HttpError.badRequest("Query is too long");

  const result = await searchCompanies(q);
  res.json({ success: true, data: result.value });
}
