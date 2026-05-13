import type { FxHistory, FxLatest, SignalAssessment, TimeRange } from "../types/fx.js";
import { MockFxProvider } from "../providers/MockFxProvider.js";
import type { FxProvider } from "../providers/FxProvider.js";
import { TwelveDataFxProvider } from "../providers/TwelveDataFxProvider.js";
import { FrankfurterFxProvider } from "../providers/FrankfurterFxProvider.js";
import { CacheService } from "./cacheService.js";
import { buildSignalAssessment } from "../utils/signalEngine.js";
import {
  fxCacheFileName,
  historyProviderPriority,
  historyCacheTtlMs,
  latestCacheTtlMs,
  latestProviderPriority,
  shouldPersistFxCache,
} from "../config/fxConfig.js";

const rangeToDays: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

const cacheService = new CacheService({
  persist: shouldPersistFxCache(),
  fileName: fxCacheFileName(),
});
const mockProvider = new MockFxProvider();
const frankfurterProvider = new FrankfurterFxProvider();

const getProviders = (priority: string[]): FxProvider[] => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  const providers = new Map<string, FxProvider>([
    ["frankfurter", frankfurterProvider],
    ["mock", mockProvider],
  ]);

  if (apiKey && apiKey !== "replace-with-your-twelve-data-api-key") {
    providers.set("twelve-data", new TwelveDataFxProvider(apiKey));
  }

  return priority
    .map((providerName) => providers.get(providerName))
    .filter((provider): provider is FxProvider => Boolean(provider));
};

const withProviderFallback = async <T>(
  providers: FxProvider[],
  action: (provider: FxProvider) => Promise<T>,
  fallbackMessage: string,
): Promise<T> => {
  let lastError: unknown;

  for (const provider of providers) {
    try {
      return await action(provider);
    } catch (error) {
      lastError = error;
      console.warn(`${provider.name} FX request failed; trying next provider.`, error);
    }
  }

  console.warn(fallbackMessage, lastError);
  return action(mockProvider);
};

export const getLatestRate = async (pairSymbol: string): Promise<FxLatest> => {
  const cacheKey = `latest:${pairSymbol}`;
  const cached = cacheService.get<FxLatest>(cacheKey);
  if (cached) {
    return cached;
  }

  const latest = await withProviderFallback(
    getProviders(latestProviderPriority()),
    (provider) => provider.getLatestRate(pairSymbol),
    "All latest FX providers failed; falling back to mock provider.",
  );

  cacheService.set(cacheKey, latest, latestCacheTtlMs());
  return latest;
};

export const getHistoricalRates = async (
  pairSymbol: string,
  range: TimeRange,
): Promise<FxHistory> => {
  const cacheKey = `history:${pairSymbol}:${range}`;
  const cached = cacheService.get<FxHistory>(cacheKey);
  if (cached) {
    return cached;
  }

  const yearlyCacheKey = `history:${pairSymbol}:1Y`;
  const cachedYear = cacheService.get<FxHistory>(yearlyCacheKey);
  if (cachedYear && range !== "1Y") {
    const derivedHistory = {
      ...cachedYear,
      points: cachedYear.points.slice(-rangeToDays[range]),
      range,
      source: `${cachedYear.source}-derived`,
    };
    cacheService.set(cacheKey, derivedHistory, historyCacheTtlMs());
    return derivedHistory;
  }

  const history = await withProviderFallback(
    getProviders(historyProviderPriority()),
    (provider) => provider.getHistoricalRates(pairSymbol, "1Y"),
    "All historical FX providers failed; falling back to mock provider.",
  );

  cacheService.set(yearlyCacheKey, history, historyCacheTtlMs());

  if (range === "1Y") {
    return history;
  }

  const derivedHistory = {
    ...history,
    points: history.points.slice(-rangeToDays[range]),
    range,
    source: `${history.source}-derived`,
  };
  cacheService.set(cacheKey, derivedHistory, historyCacheTtlMs());
  return derivedHistory;
};

export const getSignal = async (pairSymbol: string): Promise<SignalAssessment> => {
  const [history, latest] = await Promise.all([
    getHistoricalRates(pairSymbol, "1Y"),
    getLatestRate(pairSymbol),
  ]);

  const points = history.points.slice();
  if (points.length > 0) {
    points[points.length - 1] = {
      date: latest.timestamp,
      rate: latest.rate,
    };
  }

  return buildSignalAssessment(points);
};

export const buildSignalFromSeries = (
  history: FxHistory,
  latest: FxLatest,
): SignalAssessment => {
  const points = history.points.slice();

  if (points.length > 0) {
    points[points.length - 1] = {
      date: latest.timestamp,
      rate: latest.rate,
    };
  }

  return buildSignalAssessment(points);
};
