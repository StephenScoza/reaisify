import { useEffect, useState } from "react";
import {
  createAlertRule,
  deleteAlertRule,
  getAlertDeliveries,
  getAlertRules,
  sendDiscordTest,
} from "../services/fxService";
import type { AlertDeliveryLog, AlertRule } from "../types/currency";

interface AlertRuleFormProps {
  pairSymbol: string;
}

export const AlertRuleForm = ({ pairSymbol }: AlertRuleFormProps) => {
  const [targetRate, setTargetRate] = useState("");
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [deliveries, setDeliveries] = useState<AlertDeliveryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    const [alertData, deliveryData] = await Promise.all([
      getAlertRules(pairSymbol),
      getAlertDeliveries(5),
    ]);
    setAlerts(alertData);
    setDeliveries(deliveryData);
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [alertData, deliveryData] = await Promise.all([
          getAlertRules(pairSymbol),
          getAlertDeliveries(5),
        ]);
        if (isActive) {
          setAlerts(alertData);
          setDeliveries(deliveryData);
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

    void load();

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

  const testDiscord = async () => {
    try {
      setIsTesting(true);
      setError(null);
      const delivery = await sendDiscordTest(pairSymbol);
      setDeliveries((currentDeliveries) => [delivery, ...currentDeliveries].slice(0, 5));
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Failed to send Discord test.");
    } finally {
      setIsTesting(false);
    }
  };

  const removeAlert = async (id: string) => {
    try {
      setError(null);
      await deleteAlertRule(id);
      await loadAlerts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete alert.");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/45 p-6 shadow-glow backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Alert Rules</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Discord opportunity alerts</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Persist target rules and send polished Discord messages when USD/BRL crosses your threshold.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void testDiscord()}
          disabled={isTesting}
          className="rounded-xl border border-mint/30 bg-mint px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isTesting ? "Sending..." : "Test Discord"}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          step="0.01"
          min="0"
          value={targetRate}
          onChange={(event) => setTargetRate(event.target.value)}
          placeholder="Target rate, e.g. 5.40"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint/60"
        />
        <button
          type="button"
          onClick={() => void addAlert()}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Add Alert
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
            Loading alert rules...
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
            No alert rules saved yet.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium text-white">
                  Notify when {pairSymbol.toUpperCase()} exceeds {alert.targetRate.toFixed(2)}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Last state: {alert.lastObservedState}
                  {alert.lastTriggeredAt
                    ? ` - Last sent ${new Date(alert.lastTriggeredAt).toLocaleString()}`
                    : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void removeAlert(alert.id)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-danger/40 hover:text-danger"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-3 text-sm font-semibold text-white">Recent deliveries</div>
        <div className="space-y-2">
          {deliveries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-slate-400">
              No delivery history yet.
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-white">{delivery.message}</span>
                  <span className="text-slate-400">{new Date(delivery.deliveredAt).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-mint">
                  {delivery.destination} - {delivery.recommendation} - {delivery.confidence}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
