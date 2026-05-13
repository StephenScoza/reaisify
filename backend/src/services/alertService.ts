import { randomUUID } from "node:crypto";
import type { AlertRule, AlertState } from "../types/fx.js";
import { readJsonFile, writeJsonFile } from "./fileStore.js";

const ALERTS_FILE = "alerts.json";

const getDefaultState = (targetRate: number, currentRate?: number): AlertState =>
  currentRate !== undefined && currentRate >= targetRate ? "ABOVE" : "BELOW";

export const listAlerts = async (pairSymbol?: string): Promise<AlertRule[]> => {
  const alerts = await readJsonFile<AlertRule[]>(ALERTS_FILE, []);
  return pairSymbol ? alerts.filter((alert) => alert.pairSymbol === pairSymbol) : alerts;
};

export const createAlert = async (
  input: { pairSymbol: string; targetRate: number },
  currentRate?: number,
): Promise<AlertRule> => {
  const alerts = await readJsonFile<AlertRule[]>(ALERTS_FILE, []);
  const now = new Date().toISOString();
  const alert: AlertRule = {
    id: randomUUID(),
    pairSymbol: input.pairSymbol,
    targetRate: Number(input.targetRate.toFixed(4)),
    createdAt: now,
    updatedAt: now,
    isActive: true,
    lastObservedState: getDefaultState(input.targetRate, currentRate),
  };

  alerts.unshift(alert);
  await writeJsonFile(ALERTS_FILE, alerts);
  return alert;
};

export const deleteAlert = async (id: string): Promise<boolean> => {
  const alerts = await readJsonFile<AlertRule[]>(ALERTS_FILE, []);
  const nextAlerts = alerts.filter((alert) => alert.id !== id);

  if (nextAlerts.length === alerts.length) {
    return false;
  }

  await writeJsonFile(ALERTS_FILE, nextAlerts);
  return true;
};

export const updateAlert = async (updatedAlert: AlertRule): Promise<AlertRule> => {
  const alerts = await readJsonFile<AlertRule[]>(ALERTS_FILE, []);
  const nextAlerts = alerts.map((alert) =>
    alert.id === updatedAlert.id ? { ...updatedAlert, updatedAt: new Date().toISOString() } : alert,
  );

  await writeJsonFile(ALERTS_FILE, nextAlerts);
  return nextAlerts.find((alert) => alert.id === updatedAlert.id)!;
};
