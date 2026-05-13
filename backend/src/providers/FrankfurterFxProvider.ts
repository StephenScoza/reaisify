import type { FxHistory, FxLatest, FxPoint, TimeRange } from "../types/fx.js";
import type { FxProvider } from "./FxProvider.js";
import { buildPair } from "../utils/pairs.js";

const rangeToDays: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

interface FrankfurterRateRow {
  date: string;
  base: string;
  quote: string;
  rate: number | string;
}

export class FrankfurterFxProvider implements FxProvider {
  readonly name = "frankfurter";
  private readonly baseUrl = "https://api.frankfurter.dev/v2";

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`Frankfurter request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getLatestRate(pairSymbol: string): Promise<FxLatest> {
    const pair = buildPair(pairSymbol);
    const rows = await this.fetchJson<FrankfurterRateRow[]>(
      `/rates?base=${pair.base}&quotes=${pair.quote}`,
    );
    const row = rows.find((entry) => entry.quote === pair.quote) ?? rows[0];

    if (!row) {
      throw new Error(`Frankfurter did not return a latest rate for ${pair.displayName}.`);
    }

    return {
      pair,
      rate: Number(row.rate),
      timestamp: new Date(`${row.date}T00:00:00Z`).toISOString(),
      source: this.name,
    };
  }

  async getHistoricalRates(pairSymbol: string, range: TimeRange): Promise<FxHistory> {
    const pair = buildPair(pairSymbol);
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - rangeToDays[range]);

    const fromDate = from.toISOString().slice(0, 10);
    const toDate = to.toISOString().slice(0, 10);
    const rows = await this.fetchJson<FrankfurterRateRow[]>(
      `/rates?from=${fromDate}&to=${toDate}&base=${pair.base}&quotes=${pair.quote}`,
    );

    const points: FxPoint[] = rows
      .filter((entry) => entry.quote === pair.quote)
      .map((entry) => ({
        date: new Date(`${entry.date}T00:00:00Z`).toISOString(),
        rate: Number(entry.rate),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (points.length === 0) {
      throw new Error(`Frankfurter did not return historical rates for ${pair.displayName}.`);
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
