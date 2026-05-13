import { listAlerts, updateAlert } from "./alertService.js";
import { sendOpportunityNotification } from "./discordService.js";
import { buildSignalFromSeries, getHistoricalRates, getLatestRate } from "./fxService.js";
import { alertPollIntervalMs, shouldRunAlertCheckOnStartup } from "../config/fxConfig.js";

let schedulerHandle: NodeJS.Timeout | null = null;
let isRunning = false;

const runAlertCheck = async () => {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const alerts = await listAlerts();
    const activeAlerts = alerts.filter((alert) => alert.isActive);

    for (const alert of activeAlerts) {
      const latest = await getLatestRate(alert.pairSymbol);
      const nextState = latest.rate >= alert.targetRate ? "ABOVE" : "BELOW";

      if (nextState === "ABOVE" && alert.lastObservedState !== "ABOVE") {
        const history = await getHistoricalRates(alert.pairSymbol, "30D");
        const signal = buildSignalFromSeries(history, latest);
        await sendOpportunityNotification(alert, latest, signal, history.points);
        await updateAlert({
          ...alert,
          lastObservedState: "ABOVE",
          lastTriggeredAt: new Date().toISOString(),
          lastTriggeredRate: latest.rate,
        });
        continue;
      }

      if (nextState !== alert.lastObservedState) {
        await updateAlert({
          ...alert,
          lastObservedState: nextState,
        });
      }
    }
  } catch (error) {
    console.error("Alert scheduler run failed", error);
  } finally {
    isRunning = false;
  }
};

export const startAlertScheduler = () => {
  const intervalMs = alertPollIntervalMs();

  if (schedulerHandle) {
    return;
  }

  schedulerHandle = setInterval(() => {
    void runAlertCheck();
  }, intervalMs);

  if (shouldRunAlertCheckOnStartup()) {
    void runAlertCheck();
  }
};
