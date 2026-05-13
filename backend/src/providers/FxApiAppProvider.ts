import type { FxHistory, FxLatest, FxPoint, TimeRange } from "../types/fx.js";
import type { FxProvider } from "./FxProvider.js";
import { buildPair } from "../utils/pairs.js";

const rangeToDays: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

interface FxApiPairResponse {
  rate: number;
  timestamp?: string;
}

interface FxApiHistoryResponse {
  rates?: Array<{
    date: string;
    rate: number;
  }>;
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export class FxApiAppProvider implements FxProvider {
  readonly name = "fxapi-app";
  private readonly baseUrl = "https://fxapi.app/api";

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`fxapi.app request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getLatestRate(pairSymbol: string): Promise<FxLatest> {
    const pair = buildPair(pairSymbol);
    const payload = await this.fetchJson<FxApiPairResponse>(`/${pair.base.toLowerCase()}/${pair.quote.toLowerCase()}.json`);

    if (!Number.isFinite(payload.rate)) {
      throw new Error(`fxapi.app did not return ${pair.displayName}.`);
    }

    return {
      pair,
      rate: payload.rate,
      timestamp: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
      source: this.name,
    };
  }

  async getHistoricalRates(pairSymbol: string, range: TimeRange): Promise<FxHistory> {
    const pair = buildPair(pairSymbol);
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(to.getUTCDate() - rangeToDays[range]);
    const payload = await this.fetchJson<FxApiHistoryResponse>(
      `/history/${pair.base.toLowerCase()}/${pair.quote.toLowerCase()}.json?from=${isoDate(from)}&to=${isoDate(to)}`,
    );

    const points: FxPoint[] = (payload.rates ?? [])
      .map((entry) => ({
        date: new Date(`${entry.date}T00:00:00Z`).toISOString(),
        rate: Number(entry.rate),
      }))
      .filter((point) => Number.isFinite(point.rate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (points.length === 0) {
      throw new Error(`fxapi.app did not return historical rates for ${pair.displayName}.`);
    }

    return {
      pair,
      points,
      range,
      source: this.name,
      updatedAt: new Date().toISOString(),
    };
  }
}
