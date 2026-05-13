import { useEffect, useState } from "react";
import { createAlertRule, deleteAlertRule, getAlertRules } from "../services/fxService";
import type { AlertRule } from "../types/currency";

interface AlertRuleFormProps {
  pairSymbol: string;
}

export const AlertRuleForm = ({ pairSymbol }: AlertRuleFormProps) => {
  const [targetRate, setTargetRate] = useState("");
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadAlerts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getAlertRules(pairSymbol);
        if (isActive) {
          setAlerts(data);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load alerts.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadAlerts();

    return () => {
      isActive = false;
    };
  }, [pairSymbol]);

  const addAlert = async () => {
    const parsedRate = Number(targetRate);
    if (!parsedRate) {
      return;
    }

    try {
      setError(null);
      const alert = await createAlertRule(pairSymbol, parsedRate);
      setAlerts((currentAlerts) => [alert, ...currentAlerts]);
      setTargetRate("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create alert.");
    }
  };

  const removeAlert = async (id: string) => {
    try {
      setError(null);
      await deleteAlertRule(id);
      setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete alert.");
    }
  };

  return (
    <section className="rounded-[24px] border border-white/10 bg-slate-950/45 p-6 shadow-glow backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Alert Rules</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Save target-rate reminders</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Alerts persist in the backend and can trigger Discord opportunity messages when USD/BRL crosses your target.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          step="0.01"
          min="0"
          value={targetRate}
          onChange={(event) => setTargetRate(event.target.value)}
          placeholder="Target rate, e.g. 5.40"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint/60"
        />
        <button
          type="button"
          onClick={() => void addAlert()}
          className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-100"
        >
          Add Alert
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
            Loading alert rules...
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
            No alert rules saved yet.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium text-white">
                  Notify when {pairSymbol.toUpperCase()} exceeds {alert.targetRate.toFixed(2)}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Created {new Date(alert.createdAt).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Last state: {alert.lastObservedState}
                  {alert.lastTriggeredAt
                    ? ` • Last sent ${new Date(alert.lastTriggeredAt).toLocaleString()}`
                    : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void removeAlert(alert.id)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-danger/40 hover:text-danger"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
