import { randomUUID } from "node:crypto";
import type { AlertDeliveryLog, AlertRule, FxLatest, SignalAssessment } from "../types/fx.js";
import { appendLogLine } from "./fileStore.js";

const DELIVERY_LOG_FILE = "alert-deliveries.log";

const buildDiscordPayload = (alert: AlertRule, latest: FxLatest, signal: SignalAssessment) => ({
  username: "Currency Tracker",
  embeds: [
    {
      title: `FX opportunity: ${latest.pair.base}/${latest.pair.quote}`,
      color:
        signal.recommendation === "GOOD"
          ? 0x2ecc71
          : signal.recommendation === "NEUTRAL"
            ? 0xf39c12
            : 0xe74c3c,
      description: signal.reasoning,
      fields: [
        { name: "Observed rate", value: latest.rate.toFixed(4), inline: true },
        { name: "Target rate", value: alert.targetRate.toFixed(4), inline: true },
        { name: "Recommendation", value: signal.recommendation, inline: true },
        { name: "Confidence", value: `${signal.confidence}%`, inline: true },
        { name: "Trend", value: signal.trendDirection, inline: true },
      ],
      timestamp: latest.timestamp,
    },
  ],
});

const buildLogEntry = (
  alert: AlertRule,
  latest: FxLatest,
  signal: SignalAssessment,
  destination: AlertDeliveryLog["destination"],
): AlertDeliveryLog => ({
  id: randomUUID(),
  alertId: alert.id,
  pairSymbol: alert.pairSymbol,
  targetRate: alert.targetRate,
  observedRate: latest.rate,
  recommendation: signal.recommendation,
  confidence: signal.confidence,
  deliveredAt: new Date().toISOString(),
  destination,
  message: `${latest.pair.base}/${latest.pair.quote} reached ${latest.rate.toFixed(4)} against target ${alert.targetRate.toFixed(4)}.`,
});

export const sendOpportunityNotification = async (
  alert: AlertRule,
  latest: FxLatest,
  signal: SignalAssessment,
) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  const destination: AlertDeliveryLog["destination"] = webhookUrl ? "discord" : "log-only";
  const logEntry = buildLogEntry(alert, latest, signal, destination);

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildDiscordPayload(alert, latest, signal)),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed with status ${response.status}`);
    }
  }

  await appendLogLine(DELIVERY_LOG_FILE, JSON.stringify(logEntry));
  return logEntry;
};
