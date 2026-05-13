export type Recommendation = "GOOD" | "NEUTRAL" | "WAIT";
export type TrendDirection = "UP" | "DOWN" | "SIDEWAYS";
export type TimeRange = "7D" | "30D" | "90D" | "1Y";

export interface CurrencyPair {
  base: string;
  quote: string;
  symbol: string;
  displayName: string;
}

export interface FxPoint {
  date: string;
  rate: number;
}

export interface FxLatest {
  pair: CurrencyPair;
  rate: number;
  timestamp: string;
  source: string;
  previousRate?: number;
}

export interface FxHistory {
  pair: CurrencyPair;
  points: FxPoint[];
  range: TimeRange;
  source: string;
  updatedAt: string;
}

export interface SignalAssessment {
  recommendation: Recommendation;
  confidence: number;
  reasoning: string;
  trendDirection: TrendDirection;
  percentile: number;
  movingAverageGap: number;
  momentum: number;
}

export type AlertState = "ABOVE" | "BELOW";

export interface AlertRule {
  id: string;
  pairSymbol: string;
  targetRate: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastObservedState: AlertState;
  lastTriggeredAt?: string;
  lastTriggeredRate?: number;
}

export interface AlertDeliveryLog {
  id: string;
  alertId: string;
  pairSymbol: string;
  targetRate: number;
  observedRate: number;
  recommendation: Recommendation;
  confidence: number;
  deliveredAt: string;
  destination: "discord" | "log-only";
  message: string;
}
