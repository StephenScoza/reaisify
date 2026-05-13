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

export interface FxChange {
  amount: number;
  percentage: number;
}

export interface FxLatest {
  pair: CurrencyPair;
  rate: number;
  timestamp: string;
  source: string;
  previousRate?: number;
}

export interface FxSnapshot {
  currentRate: number;
  previousRate: number;
  change: FxChange;
  high: number;
  low: number;
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

export interface AlertRule {
  id: string;
  pairSymbol: string;
  targetRate: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastObservedState: "ABOVE" | "BELOW";
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

export interface SystemStatus {
  service: string;
  timestamp: string;
  liveFxConfigured: boolean;
  discordConfigured: boolean;
  alertPollIntervalMs: number;
  latestCacheTtlMs: number;
  historyCacheTtlMs: number;
  fxCachePersistence: boolean;
  alertStorageDir: string;
}

export interface FxHistory {
  pair: CurrencyPair;
  points: FxPoint[];
  range: TimeRange;
  source: string;
  updatedAt: string;
}

export interface FxDashboardData {
  pair: CurrencyPair;
  latest: FxLatest;
  history: FxHistory;
  snapshot: FxSnapshot;
  signal: SignalAssessment;
  updatedAt: string;
}

export type TransferFeeModel = "PERCENTAGE_PLUS_FIXED" | "FLAT" | "BANK_SPREAD";

export interface TransferFeeRule {
  id: string;
  providerName: string;
  model: TransferFeeModel;
  description: string;
  fixedFeeUsd: number;
  percentageFee: number;
  exchangeRateMarkup: number;
  estimatedDelivery: string;
  isLiveQuote: boolean;
}

export interface TransferFeeEstimate {
  rule: TransferFeeRule;
  sendAmountUsd: number;
  feeUsd: number;
  effectiveRate: number;
  netAmountUsd: number;
  recipientAmountBrl: number;
  totalCostUsd: number;
}
