const toPositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const latestCacheTtlMs = () =>
  toPositiveNumber(process.env.FX_LATEST_CACHE_TTL_MS, 15 * 60 * 1000);

export const historyCacheTtlMs = () =>
  toPositiveNumber(process.env.FX_HISTORY_CACHE_TTL_MS, 24 * 60 * 60 * 1000);

export const alertPollIntervalMs = () =>
  toPositiveNumber(process.env.ALERT_POLL_INTERVAL_MS, 15 * 60 * 1000);

export const shouldRunAlertCheckOnStartup = () =>
  process.env.ALERT_RUN_ON_STARTUP === "true";

export const shouldPersistFxCache = () =>
  process.env.FX_CACHE_PERSISTENCE !== "false";

export const fxCacheFileName = () =>
  process.env.FX_CACHE_FILE_NAME ?? "fx-cache.json";
