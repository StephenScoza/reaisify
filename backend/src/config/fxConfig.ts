const toPositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toNonNegativeNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const toProviderPriority = (value: string | undefined, fallback: string[]) =>
  (value ?? fallback.join(","))
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean);

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

export const providerUsageCacheTtlMs = () =>
  toPositiveNumber(process.env.PROVIDER_USAGE_CACHE_TTL_MS, 60 * 60 * 1000);

export const twelveDataCreditReserve = () =>
  toNonNegativeNumber(process.env.TWELVE_DATA_CREDIT_RESERVE, 2);

export const logDirectory = () =>
  process.env.LOG_DIR ?? `${process.env.ALERT_STORAGE_DIR ?? "./runtime"}/logs`;

export const logLevel = () =>
  process.env.LOG_LEVEL ?? "info";

export const logRotationSize = () =>
  process.env.LOG_ROTATION_SIZE ?? "10m";

export const logRetentionCount = () =>
  toPositiveNumber(process.env.LOG_RETENTION_COUNT, 7);

export const latestProviderPriority = () =>
  toProviderPriority(process.env.FX_LATEST_PROVIDER_PRIORITY, [
    "twelve-data",
    "awesomeapi",
    "fxapi-app",
    "exchange-rate-api",
    "currency-api",
    "bcb-ptax",
    "frankfurter",
    "mock",
  ]);

export const historyProviderPriority = () =>
  toProviderPriority(process.env.FX_HISTORY_PROVIDER_PRIORITY, [
    "bcb-ptax",
    "frankfurter",
    "fxapi-app",
    "twelve-data",
    "awesomeapi",
    "mock",
  ]);
