import type { FxHistory, FxLatest, SignalAssessment, TimeRange } from "../types/fx.js";
import { MockFxProvider } from "../providers/MockFxProvider.js";
import type { FxProvider } from "../providers/FxProvider.js";
import { TwelveDataFxProvider } from "../providers/TwelveDataFxProvider.js";
import { CacheService } from "./cacheService.js";
import { buildSignalAssessment } from "../utils/signalEngine.js";
import { historyCacheTtlMs, latestCacheTtlMs } from "../config/fxConfig.js";

const rangeToDays: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

const cacheService = new CacheService();
const mockProvider = new MockFxProvider();

const getProvider = (): FxProvider => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (apiKey && apiKey !== "replace-with-your-twelve-data-api-key") {
    return new TwelveDataFxProvider(apiKey);
  }

  return new MockFxProvider();
};
export const getLatestRate = async (pairSymbol: string): Promise<FxLatest> => {
  const cacheKey = `latest:${pairSymbol}`;
  const cached = cacheService.get<FxLatest>(cacheKey);
  if (cached) {
    return cached;
  }

  let latest: FxLatest;

  try {
    const provider = getProvider();
    latest = await provider.getLatestRate(pairSymbol);
  } catch (error) {
    console.warn("Live latest FX request failed; falling back to mock provider.", error);
    latest = {
      ...(await mockProvider.getLatestRate(pairSymbol)),
      source: "mock-fallback",
    };
  }

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

  let history: FxHistory;

  try {
    const provider = getProvider();
    history = await provider.getHistoricalRates(pairSymbol, "1Y");
  } catch (error) {
    console.warn("Live historical FX request failed; falling back to mock provider.", error);
    history = {
      ...(await mockProvider.getHistoricalRates(pairSymbol, "1Y")),
      source: "mock-fallback",
    };
  }

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
