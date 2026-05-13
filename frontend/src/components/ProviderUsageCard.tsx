import { useEffect, useState } from "react";
import { getProviderUsage } from "../services/fxService";
import type { ProviderUsageSnapshot } from "../types/currency";

const formatUsageTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return "Waiting for provider data";
  }

  return new Date(timestamp).toLocaleString();
};

export const ProviderUsageCard = () => {
  const [usage, setUsage] = useState<ProviderUsageSnapshot | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadUsage = async () => {
      try {
        const data = await getProviderUsage();
        if (isActive) {
          setUsage(data);
        }
      } catch {
        if (isActive) {
          setUsage(null);
        }
      }
    };

    void loadUsage();
    const handle = window.setInterval(() => void loadUsage(), 5 * 60_000);

    return () => {
      isActive = false;
      window.clearInterval(handle);
    };
  }, []);

  const used = usage?.apiCreditsUsed;
  const left = usage?.apiCreditsLeft;
  const limit = usage?.apiCreditLimit;
  const usagePercent = used !== undefined && limit ? Math.min(100, Math.round((used / limit) * 100)) : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 text-ink shadow-glow">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Provider Credits</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Twelve Data usage</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Best-known quota data captured from backend-only provider calls.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slatebrand">
          {usage?.source === "response-headers" ? "No extra credit" : usage?.source ?? "Waiting"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Credits used</div>
          <div className="mt-2 text-2xl font-bold text-ink">{used ?? "--"}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Credits left</div>
          <div className="mt-2 text-2xl font-bold text-mint">{left ?? "--"}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Plan limit</div>
          <div className="mt-2 text-2xl font-bold text-ink">{limit ?? "--"}</div>
        </div>
      </div>

      {usagePercent !== null ? (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-mint" style={{ width: `${usagePercent}%` }} />
          </div>
          <div className="mt-2 text-xs text-slate-500">{usagePercent}% of known quota used</div>
        </div>
      ) : null}

      <div className="mt-4 text-xs leading-5 text-slate-500">
        Updated {formatUsageTimestamp(usage?.updatedAt)}. Manual provider usage refreshes are available via the backend, but are not called automatically because they can spend an API credit.
      </div>
    </section>
  );
};
