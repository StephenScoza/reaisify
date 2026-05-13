import { useEffect, useState } from "react";
import { getCacheStatus } from "../services/fxService";
import type { CacheEntryStatus } from "../types/currency";
import { Icon } from "./Icon";

const formatTtl = (seconds: number) => {
  if (seconds <= 0) {
    return "Expired";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  return `${Math.round(minutes / 60)}h`;
};

const formatCacheKey = (key: string) =>
  key
    .replaceAll(":", " / ")
    .replace("usd-brl", "USD/BRL")
    .replace("latest", "Latest")
    .replace("history", "History");

export const CacheStatusCard = () => {
  const [entries, setEntries] = useState<CacheEntryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCacheStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setEntries(await getCacheStatus());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load cache status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCacheStatus();
  }, []);

  const activeEntries = entries.filter((entry) => !entry.isExpired);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surf p-2 text-mint">
              <Icon name="cache" className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">FX Cache</p>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-ink">Cached provider responses</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            These entries can serve the dashboard without spending Twelve Data credits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadCacheStatus()}
          disabled={isLoading}
          className="rounded-xl border border-slate-200 bg-sand px-4 py-3 text-sm font-semibold text-ink transition hover:border-mint/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh cache view"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Active entries</div>
          <div className="mt-1 text-2xl font-bold text-ink">{activeEntries.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Total tracked</div>
          <div className="mt-1 text-2xl font-bold text-ink">{entries.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Shortest TTL</div>
          <div className="mt-1 text-2xl font-bold text-ink">
            {activeEntries.length > 0 ? formatTtl(Math.min(...activeEntries.map((entry) => entry.ttlSeconds))) : "--"}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        {entries.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-sand px-4 py-5 text-sm text-slate-600">
            No cached FX responses yet. Open the dashboard once to populate latest and history entries.
          </div>
        ) : null}

        {entries.map((entry) => (
          <div key={entry.key} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-sand px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-ink">{formatCacheKey(entry.key)}</div>
              <div className="mt-1 text-xs text-slate-500">Expires {new Date(entry.expiresAt).toLocaleString()}</div>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${entry.isExpired ? "border-danger/20 bg-red-50 text-danger" : "border-mint/20 bg-surf text-mint"}`}>
              {formatTtl(entry.ttlSeconds)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
