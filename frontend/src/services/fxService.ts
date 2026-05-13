import {
  createMockUsdBrlHistory,
  createMockUsdBrlLatest,
  createMockUsdBrlSeries,
  createMockUsdBrlSignal,
} from "../data/mockUsdBrl";
import type {
  AlertRule,
  FxDashboardData,
  FxHistory,
  FxLatest,
  SignalAssessment,
  TimeRange,
} from "../types/currency";
import { buildSignalAssessment } from "../utils/signalEngine";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:7001";

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`FX request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getLatestRate = async (pairSymbol: string): Promise<FxLatest> => {
  try {
    const payload = await fetchJson<{ data: FxLatest }>(`/fx/${pairSymbol}/latest`);
    return payload.data;
  } catch (error) {
    if (pairSymbol === "usd-brl") {
      return createMockUsdBrlLatest();
    }

    throw error;
  }
};

export const getHistoricalRates = async (pairSymbol: string, range: TimeRange): Promise<FxHistory> => {
  try {
    const payload = await fetchJson<{ data: FxHistory }>(`/fx/${pairSymbol}/history?range=${range}`);
    return payload.data;
  } catch (error) {
    if (pairSymbol === "usd-brl") {
      return createMockUsdBrlHistory(range);
    }

    throw error;
  }
};

export const getSignal = async (pairSymbol: string): Promise<SignalAssessment> => {
  try {
    const payload = await fetchJson<{ data: SignalAssessment }>(`/fx/${pairSymbol}/signal`);
    return payload.data;
  } catch (error) {
    if (pairSymbol === "usd-brl") {
      return createMockUsdBrlSignal();
    }

    throw error;
  }
};

export const getFxDashboardData = async (
  pairSymbol: string,
  range: TimeRange,
): Promise<FxDashboardData> => {
  try {
    const [latest, history] = await Promise.all([
      getLatestRate(pairSymbol),
      getHistoricalRates(pairSymbol, range),
    ]);
    const previousRate = latest.previousRate ?? history.points[history.points.length - 2]?.rate ?? latest.rate;
    const changeAmount = latest.rate - previousRate;
    const signalPoints = history.points.slice();

    if (signalPoints.length > 0) {
      signalPoints[signalPoints.length - 1] = {
        date: latest.timestamp,
        rate: latest.rate,
      };
    }

    return {
      pair: latest.pair,
      latest,
      history,
      snapshot: {
        currentRate: latest.rate,
        previousRate,
        change: {
          amount: Number(changeAmount.toFixed(4)),
          percentage: Number(((changeAmount / previousRate) * 100).toFixed(2)),
        },
        high: Math.max(...history.points.map((point) => point.rate)),
        low: Math.min(...history.points.map((point) => point.rate)),
      },
      signal: buildSignalAssessment(signalPoints),
      updatedAt: latest.timestamp,
    };
  } catch (error) {
    if (pairSymbol === "usd-brl") {
      return createMockUsdBrlSeries();
    }

    throw error;
  }
};

export const getAlertRules = async (pairSymbol: string): Promise<AlertRule[]> => {
  const payload = await fetchJson<{ data: AlertRule[] }>(`/alerts?pairSymbol=${pairSymbol}`);
  return payload.data;
};

export const createAlertRule = async (
  pairSymbol: string,
  targetRate: number,
): Promise<AlertRule> => {
  const response = await fetch(`${API_URL}/alerts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pairSymbol,
      targetRate,
    }),
  });

  if (!response.ok) {
    throw new Error(`Alert request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { data: AlertRule };
  return payload.data;
};

export const deleteAlertRule = async (id: string) => {
  const response = await fetch(`${API_URL}/alerts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Alert delete failed with status ${response.status}`);
  }
};
