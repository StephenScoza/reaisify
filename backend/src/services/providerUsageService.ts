import type { ProviderUsageSnapshot } from "../types/fx.js";
import { providerUsageCacheTtlMs, twelveDataCreditReserve } from "../config/fxConfig.js";
import { readJsonFile, writeJsonFile } from "./fileStore.js";

const USAGE_FILE_NAME = "provider-usage.json";
const TWELVE_DATA_PROVIDER = "twelve-data";
const TWELVE_DATA_PLACEHOLDER_KEY = "replace-with-your-twelve-data-api-key";

const notAvailableSnapshot = (): ProviderUsageSnapshot => ({
  providerName: TWELVE_DATA_PROVIDER,
  source: "not-available",
  updatedAt: new Date().toISOString(),
  note: "No provider usage data has been captured yet.",
});

const readUsage = async () =>
  readJsonFile<ProviderUsageSnapshot>(USAGE_FILE_NAME, notAvailableSnapshot());

const writeUsage = async (snapshot: ProviderUsageSnapshot) => {
  await writeJsonFile(USAGE_FILE_NAME, snapshot);
  return snapshot;
};

const getHeaderNumber = (headers: Headers, name: string) => {
  const value = headers.get(name);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const findNumberByKeys = (payload: unknown, keys: string[]): number | undefined => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (keys.includes(normalizedKey) && typeof value !== "object") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  for (const value of Object.values(record)) {
    const nested = findNumberByKeys(value, keys);
    if (nested !== undefined) {
      return nested;
    }
  }

  return undefined;
};

const normalizeApiUsagePayload = (payload: unknown): ProviderUsageSnapshot => {
  const apiCreditsUsed = findNumberByKeys(payload, [
    "apicreditsused",
    "creditsused",
    "currentusage",
    "usage",
    "used",
  ]);
  const apiCreditsLeft = findNumberByKeys(payload, [
    "apicreditsleft",
    "creditsleft",
    "remaining",
    "remainingcredits",
  ]);
  const apiCreditLimit = findNumberByKeys(payload, [
    "apicreditlimit",
    "creditlimit",
    "planlimit",
    "limit",
    "total",
  ]);

  return {
    providerName: TWELVE_DATA_PROVIDER,
    source: "api-usage",
    updatedAt: new Date().toISOString(),
    apiCreditsUsed,
    apiCreditsLeft,
    apiCreditLimit,
    raw: payload,
    note: "Manual provider usage refresh. Twelve Data counts this endpoint as an API credit.",
  };
};

export const recordTwelveDataUsageFromHeaders = async (headers: Headers) => {
  const apiCreditsUsed = getHeaderNumber(headers, "api-credits-used");
  const apiCreditsLeft = getHeaderNumber(headers, "api-credits-left");

  if (apiCreditsUsed === undefined && apiCreditsLeft === undefined) {
    return;
  }

  const apiCreditLimit =
    apiCreditsUsed !== undefined && apiCreditsLeft !== undefined
      ? apiCreditsUsed + apiCreditsLeft
      : undefined;

  await writeUsage({
    providerName: TWELVE_DATA_PROVIDER,
    source: "response-headers",
    updatedAt: new Date().toISOString(),
    apiCreditsUsed,
    apiCreditsLeft,
    apiCreditLimit,
    note: "Captured from normal Twelve Data response headers without an extra usage API call.",
  });
};

export const getProviderUsage = async () => readUsage();

export const shouldReserveTwelveDataCredits = async () => {
  const reserve = twelveDataCreditReserve();
  if (reserve <= 0) {
    return false;
  }

  const usage = await readUsage();
  return usage.apiCreditsLeft !== undefined && usage.apiCreditsLeft <= reserve;
};

export const refreshTwelveDataUsage = async () => {
  const apiKey = process.env.TWELVE_DATA_API_KEY?.trim();
  if (!apiKey || apiKey === TWELVE_DATA_PLACEHOLDER_KEY) {
    return writeUsage({
      ...notAvailableSnapshot(),
      note: "Twelve Data API key is not configured.",
    });
  }

  const cached = await readUsage();
  const cachedAgeMs = Date.now() - new Date(cached.updatedAt).getTime();
  if (cached.source === "api-usage" && cachedAgeMs < providerUsageCacheTtlMs()) {
    return cached;
  }

  const response = await fetch(`https://api.twelvedata.com/api_usage?apikey=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Twelve Data usage request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return writeUsage(normalizeApiUsagePayload(payload));
};
