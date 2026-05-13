import type { FxHistory, FxLatest, FxPoint, TimeRange } from "../types/fx.js";
import type { FxProvider } from "./FxProvider.js";
import { buildPair } from "../utils/pairs.js";

const rangeToDays: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

interface AwesomeLatestRate {
  bid: string;
  ask?: string;
  timestamp?: string;
  create_date?: string;
}

interface AwesomeDailyRate {
  bid: string;
  ask?: string;
  timestamp?: string;
  create_date?: string;
}

const rateFromBidAsk = (bid: string, ask?: string) => {
  const bidRate = Number(bid);
  const askRate = Number(ask);

  if (Number.isFinite(bidRate) && Number.isFinite(askRate)) {
    return (bidRate + askRate) / 2;
  }

  return bidRate;
};

const timestampFromAwesome = (entry: { timestamp?: string; create_date?: string }) => {
  if (entry.timestamp) {
    return new Date(Number(entry.timestamp) * 1000).toISOString();
  }

  if (entry.create_date) {
    return new Date(entry.create_date.replace(" ", "T")).toISOString();
  }

  return new Date().toISOString();
};

export class AwesomeApiFxProvider implements FxProvider {
  readonly name = "awesomeapi";
  private readonly baseUrl = "https://economia.awesomeapi.com.br";

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`AwesomeAPI request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getLatestRate(pairSymbol: string): Promise<FxLatest> {
    const pair = buildPair(pairSymbol);
    const awesomeSymbol = `${pair.base}-${pair.quote}`;
    const payload = await this.fetchJson<Record<string, AwesomeLatestRate>>(`/last/${awesomeSymbol}`);
    const row = payload[`${pair.base}${pair.quote}`] ?? Object.values(payload)[0];

    if (!row) {
      throw new Error(`AwesomeAPI did not return a latest rate for ${pair.displayName}.`);
    }

    return {
      pair,
      rate: rateFromBidAsk(row.bid, row.ask),
      timestamp: timestampFromAwesome(row),
      source: this.name,
    };
  }

  async getHistoricalRates(pairSymbol: string, range: TimeRange): Promise<FxHistory> {
    const pair = buildPair(pairSymbol);
    const days = rangeToDays[range];
    const awesomeSymbol = `${pair.base}-${pair.quote}`;
    const rows = await this.fetchJson<AwesomeDailyRate[]>(`/json/daily/${awesomeSymbol}/${days}`);

    const points: FxPoint[] = rows
      .map((entry) => ({
        date: timestampFromAwesome(entry),
        rate: rateFromBidAsk(entry.bid, entry.ask),
      }))
      .filter((point) => Number.isFinite(point.rate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (points.length === 0) {
      throw new Error(`AwesomeAPI did not return historical rates for ${pair.displayName}.`);
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
