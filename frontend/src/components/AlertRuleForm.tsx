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
  const [notice, setNotice] = useState<string | null>(null);
  const parsedTargetRate = Number(targetRate);
  const canCreateAlert = parsedTargetRate > 0;

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
      setNotice(null);
      const alert = await createAlertRule(pairSymbol, parsedRate);
      setAlerts((currentAlerts) => [alert, ...currentAlerts]);
      setTargetRate("");
      setNotice(`Alert saved for ${pairSymbol.toUpperCase()} above ${parsedRate.toFixed(2)}.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create alert.");
    }
  };

  const testDiscord = async () => {
    try {
      setIsTesting(true);
      setError(null);
      setNotice(null);
      const delivery = await sendDiscordTest(pairSymbol);
      setDeliveries((currentDeliveries) => [delivery, ...currentDeliveries].slice(0, 5));
      setNotice("Discord test sent successfully.");
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Failed to send Discord test.");
    } finally {
      setIsTesting(false);
    }
  };

  const removeAlert = async (id: string) => {
    try {
      setError(null);
      setNotice(null);
      await deleteAlertRule(id);
      await loadAlerts();
      setNotice("Alert rule removed.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete alert.");
    }
  };

  return (
    <section className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Alert Rules</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">Discord opportunity alerts</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Persist target rules and send polished Discord messages when USD/BRL crosses your threshold.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void testDiscord()}
          disabled={isTesting}
          className="w-full rounded-xl border border-mint/30 bg-mint px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
          className="w-full rounded-xl border border-slate-200 bg-sand px-4 py-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-mint/60"
        />
        <button
          type="button"
          onClick={() => void addAlert()}
          disabled={!canCreateAlert}
          className="rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Alert
        </button>
      </div>

      {notice ? (
        <div className="mt-4 rounded-xl border border-mint/20 bg-surf px-4 py-3 text-sm text-mint">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
            Loading alert rules...
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
            No alert rules saved yet.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-sand px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-semibold text-ink">
                  Notify when {pairSymbol.toUpperCase()} exceeds {alert.targetRate.toFixed(2)}
                </div>
                <div className="mt-1 break-words text-sm text-slate-500">
                  Last state: {alert.lastObservedState}
                  {alert.lastTriggeredAt
                    ? ` - Last sent ${new Date(alert.lastTriggeredAt).toLocaleString()}`
                    : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void removeAlert(alert.id)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-danger/40 hover:text-danger sm:w-auto"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="mb-3 text-sm font-semibold text-ink">Recent deliveries</div>
        <div className="space-y-2">
          {deliveries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
              No delivery history yet.
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-xl border border-slate-200 bg-sand px-4 py-3">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0 break-words font-medium text-ink">{delivery.message}</span>
                  <span className="shrink-0 text-slate-500">{new Date(delivery.deliveredAt).toLocaleString()}</span>
                </div>
                <div className="mt-1 break-words text-xs uppercase tracking-[0.16em] text-mint">
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
