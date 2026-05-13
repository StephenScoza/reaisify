import type { FxHistory, FxLatest, TimeRange } from "../types/fx.js";
import type { FxProvider } from "./FxProvider.js";
import { buildPair } from "../utils/pairs.js";

interface FawazPairResponse {
  date?: string;
  [currencyCode: string]: string | number | undefined;
}

export class FawazCurrencyApiProvider implements FxProvider {
  readonly name = "currency-api";
  private readonly baseUrl = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies";

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`Currency API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getLatestRate(pairSymbol: string): Promise<FxLatest> {
    const pair = buildPair(pairSymbol);
    const base = pair.base.toLowerCase();
    const quote = pair.quote.toLowerCase();
    const payload = await this.fetchJson<FawazPairResponse>(`/${base}/${quote}.json`);
    const rate = Number(payload[quote]);

    if (!Number.isFinite(rate)) {
      throw new Error(`Currency API did not return ${pair.displayName}.`);
    }

    return {
      pair,
      rate,
      timestamp: payload.date ? new Date(`${payload.date}T00:00:00Z`).toISOString() : new Date().toISOString(),
      source: this.name,
    };
  }

  async getHistoricalRates(_pairSymbol: string, _range: TimeRange): Promise<FxHistory> {
    throw new Error("Currency API fallback is latest-only in Reaisify.");
  }
}
