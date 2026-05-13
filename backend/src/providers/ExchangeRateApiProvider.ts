import type { FxHistory, FxLatest, TimeRange } from "../types/fx.js";
import type { FxProvider } from "./FxProvider.js";
import { buildPair } from "../utils/pairs.js";

interface ExchangeRateApiResponse {
  result: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
  "error-type"?: string;
}

export class ExchangeRateApiProvider implements FxProvider {
  readonly name = "exchange-rate-api";
  private readonly baseUrl = "https://open.er-api.com/v6";

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`ExchangeRate-API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getLatestRate(pairSymbol: string): Promise<FxLatest> {
    const pair = buildPair(pairSymbol);
    const payload = await this.fetchJson<ExchangeRateApiResponse>(`/latest/${pair.base}`);
    const rate = payload.rates?.[pair.quote];

    if (payload.result !== "success" || typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new Error(payload["error-type"] ?? `ExchangeRate-API did not return ${pair.displayName}.`);
    }

    return {
      pair,
      rate,
      timestamp: payload.time_last_update_utc
        ? new Date(payload.time_last_update_utc).toISOString()
        : new Date().toISOString(),
      source: this.name,
    };
  }

  async getHistoricalRates(_pairSymbol: string, _range: TimeRange): Promise<FxHistory> {
    throw new Error("ExchangeRate-API open endpoint is latest-only in Reaisify.");
  }
}
