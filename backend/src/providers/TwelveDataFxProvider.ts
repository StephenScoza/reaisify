import type { FxHistory, FxLatest, FxPoint, TimeRange } from "../types/fx.js";
import type { FxProvider } from "./FxProvider.js";
import { buildPair, toTwelveDataSymbol } from "../utils/pairs.js";
import { recordTwelveDataUsageFromHeaders } from "../services/providerUsageService.js";

const rangeToDays: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

interface TwelveDataCurrencyConversionResponse {
  rate: number | string;
  timestamp?: number;
  status?: string;
  code?: number;
  message?: string;
}

interface TwelveDataTimeSeriesResponse {
  values?: Array<{
    datetime: string;
    close: string;
  }>;
  status?: string;
  code?: number;
  message?: string;
}

export class TwelveDataFxProvider implements FxProvider {
  readonly name = "twelve-data";

  constructor(private readonly apiKey: string) {}

  private async fetchJson<T extends { status?: string; code?: number; message?: string }>(
    url: string,
  ): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Twelve Data request failed with status ${response.status}`);
    }

    await recordTwelveDataUsageFromHeaders(response.headers);

    const payload = (await response.json()) as T;
    if (payload.status === "error" || payload.code) {
      throw new Error(payload.message ?? "Twelve Data returned an error.");
    }

    return payload;
  }

  async getLatestRate(pairSymbol: string): Promise<FxLatest> {
    const pair = buildPair(pairSymbol);
    const symbol = encodeURIComponent(toTwelveDataSymbol(pair));
    const latestUrl = `https://api.twelvedata.com/currency_conversion?symbol=${symbol}&amount=1&apikey=${this.apiKey}`;
    const latestPayload = await this.fetchJson<TwelveDataCurrencyConversionResponse>(latestUrl);

    return {
      pair,
      rate: Number(latestPayload.rate),
      timestamp: latestPayload.timestamp
        ? new Date(latestPayload.timestamp * 1000).toISOString()
        : new Date().toISOString(),
      source: this.name,
    };
  }

  async getHistoricalRates(pairSymbol: string, range: TimeRange): Promise<FxHistory> {
    const pair = buildPair(pairSymbol);
    const outputsize = rangeToDays[range];
    const historyUrl = `https://api.twelvedata.com/time_series/cross?base=${pair.base}&quote=${pair.quote}&interval=1day&outputsize=${outputsize}&timezone=UTC&apikey=${this.apiKey}`;
    const payload = await this.fetchJson<TwelveDataTimeSeriesResponse>(historyUrl);

    const points: FxPoint[] = (payload.values ?? [])
      .map((entry) => ({
        date: new Date(`${entry.datetime}T00:00:00Z`).toISOString(),
        rate: Number(entry.close),
      }))
      .reverse();

    return {
      pair,
      points,
      range,
      source: this.name,
      updatedAt: new Date().toISOString(),
    };
  }
}
