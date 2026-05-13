import { Router } from "express";
import { getSystemStatus } from "../services/statusService.js";
import { getProviderUsage, refreshTwelveDataUsage } from "../services/providerUsageService.js";

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
