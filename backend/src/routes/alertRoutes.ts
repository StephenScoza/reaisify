import { Router } from "express";
import { createAlert, deleteAlert, listAlerts } from "../services/alertService.js";
import { listDeliveryLogs, sendOpportunityNotification } from "../services/discordService.js";
import { buildSignalFromSeries, getHistoricalRates, getLatestRate } from "../services/fxService.js";

export const alertRoutes = Router();

alertRoutes.get("/", async (request, response) => {
  try {
    const pairSymbol =
      typeof request.query.pairSymbol === "string" ? request.query.pairSymbol.toLowerCase() : undefined;
    const data = await listAlerts(pairSymbol);
    response.json({ data });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Failed to load alerts.",
    });
  }
});

alertRoutes.get("/deliveries", async (request, response) => {
  try {
    const limit = Number(request.query.limit ?? 10);
    const data = await listDeliveryLogs(Number.isFinite(limit) ? limit : 10);
    response.json({ data });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Failed to load alert deliveries.",
    });
  }
});

alertRoutes.post("/", async (request, response) => {
  try {
    const pairSymbol = String(request.body.pairSymbol ?? "").toLowerCase();
    const targetRate = Number(request.body.targetRate);

    if (!pairSymbol || !Number.isFinite(targetRate) || targetRate <= 0) {
      response.status(400).json({
        error: "pairSymbol and a positive targetRate are required.",
      });
      return;
    }

    const latest = await getLatestRate(pairSymbol);
    const data = await createAlert({ pairSymbol, targetRate }, latest.rate);
    response.status(201).json({ data });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create alert.",
    });
  }
});

alertRoutes.post("/test-discord", async (request, response) => {
  try {
    const pairSymbol = String(request.body.pairSymbol ?? "usd-brl").toLowerCase();
    const latest = await getLatestRate(pairSymbol);
    const history = await getHistoricalRates(pairSymbol, "30D");
    const signal = buildSignalFromSeries(history, latest);
    const data = await sendOpportunityNotification(
      {
        id: "manual-test",
        pairSymbol,
        targetRate: latest.rate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastObservedState: "ABOVE",
      },
      latest,
      signal,
      history.points,
    );

    response.json({ data });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Failed to send Discord test.",
    });
  }
});

alertRoutes.delete("/:id", async (request, response) => {
  try {
    const deleted = await deleteAlert(request.params.id);

    if (!deleted) {
      response.status(404).json({ error: "Alert not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete alert.",
    });
  }
});
