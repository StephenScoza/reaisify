import { Router } from "express";
import { getSystemStatus } from "../services/statusService.js";
import { getProviderUsage, refreshTwelveDataUsage } from "../services/providerUsageService.js";
import { getRecentLogLines } from "../services/logger.js";
import { getFxCacheStatus } from "../services/fxService.js";

export const statusRoutes = Router();

statusRoutes.get("/", (_request, response) => {
  response.json({
    data: getSystemStatus(),
  });
});

statusRoutes.get("/provider-usage", async (request, response) => {
  try {
    const refresh = request.query.refresh === "true";
    const data = refresh ? await refreshTwelveDataUsage() : await getProviderUsage();

    response.json({ data });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Failed to load provider usage.",
    });
  }
});

statusRoutes.get("/cache", (_request, response) => {
  response.json({
    data: getFxCacheStatus(),
  });
});

statusRoutes.get("/logs", async (request, response) => {
  try {
    const limit = Number(request.query.limit ?? 100);
    const lines = await getRecentLogLines(limit);
    response.json({
      data: lines.map((line) => {
        try {
          return JSON.parse(line) as unknown;
        } catch {
          return { message: line };
        }
      }),
    });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Failed to load logs.",
    });
  }
});
