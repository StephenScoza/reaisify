import { listAlerts, updateAlert } from "./alertService.js";
import { sendOpportunityNotification } from "./discordService.js";
import { getLatestRate, getSignal } from "./fxService.js";

const DEFAULT_POLL_INTERVAL_MS = 60_000;

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
        const signal = await getSignal(alert.pairSymbol);
        await sendOpportunityNotification(alert, latest, signal);
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
  const intervalMs = Number(process.env.ALERT_POLL_INTERVAL_MS ?? DEFAULT_POLL_INTERVAL_MS);

  if (schedulerHandle) {
    return;
  }

  schedulerHandle = setInterval(() => {
    void runAlertCheck();
  }, intervalMs);

  void runAlertCheck();
};
