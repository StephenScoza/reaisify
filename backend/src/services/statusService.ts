import { isDiscordConfigured } from "./discordService.js";
import {
  alertPollIntervalMs,
  historyCacheTtlMs,
  historyProviderPriority,
  latestCacheTtlMs,
  latestProviderPriority,
  shouldPersistFxCache,
} from "../config/fxConfig.js";

const hasConfiguredTwelveDataKey = () => {
  const apiKey = process.env.TWELVE_DATA_API_KEY?.trim();
  return Boolean(apiKey && apiKey !== "replace-with-your-twelve-data-api-key");
};

export const getSystemStatus = () => ({
  service: "currency-tracker-api",
  timestamp: new Date().toISOString(),
  liveFxConfigured: hasConfiguredTwelveDataKey(),
  discordConfigured: isDiscordConfigured(),
  alertPollIntervalMs: alertPollIntervalMs(),
  latestCacheTtlMs: latestCacheTtlMs(),
  historyCacheTtlMs: historyCacheTtlMs(),
  fxCachePersistence: shouldPersistFxCache(),
  latestProviderPriority: latestProviderPriority(),
  historyProviderPriority: historyProviderPriority(),
  alertStorageDir: process.env.ALERT_STORAGE_DIR ?? "./runtime",
});
