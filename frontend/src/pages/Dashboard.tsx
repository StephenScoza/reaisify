import { useState } from "react";
import { AlertRuleForm } from "../components/AlertRuleForm";
import { Converter } from "../components/Converter";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardFooter } from "../components/DashboardFooter";
import { EmptyState } from "../components/EmptyState";
import { ExchangeChart } from "../components/ExchangeChart";
import { RateCard } from "../components/RateCard";
import { SignalCard } from "../components/SignalCard";
import { SystemStatusStrip } from "../components/SystemStatusStrip";
import { TimeRangeToggle } from "../components/TimeRangeToggle";
import { TransferPlanningCard } from "../components/TransferPlanningCard";
import { useExchangeRates } from "../hooks/useExchangeRates";
import type { TimeRange } from "../types/currency";

const pairSymbol = "usd-brl";

const DashboardSkeleton = () => (
  <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 xl:px-8">
    <div className="space-y-6">
      <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/80 shadow-glow" />
      <div className="grid gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white/80" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white/80" />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white/80" />
      </div>
    </div>
  </main>
);

export const Dashboard = () => {
  const [range, setRange] = useState<TimeRange>("7D");
  const { series, filteredPoints, isLoading, error, retry } = useExchangeRates(pairSymbol, range);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !series) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12 text-ink">
        <EmptyState
          tone="danger"
          title="FX data needs a quick refresh"
          message={error ?? "Unable to load exchange data. The backend may still be starting, or the provider cache may be unavailable."}
          action={
            <button
              type="button"
              onClick={retry}
              className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ocean"
            >
              Retry dashboard
            </button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 md:px-6 md:py-8 xl:px-8">
      <div className="min-w-0 space-y-6">
        <DashboardHeader pair={series.pair} updatedAt={series.updatedAt} source={series.latest.source} />
        <SystemStatusStrip />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RateCard
            snapshot={series.snapshot}
            base={series.pair.base}
            quote={series.pair.quote}
            source={series.latest.source}
            updatedAt={series.updatedAt}
          />
          <SignalCard signal={series.signal} />
        </div>

        <section className="min-w-0">
          <ExchangeChart
            points={filteredPoints}
            title={`${series.pair.base}/${series.pair.quote} rate path`}
            source={series.history.source}
            updatedAt={series.history.updatedAt}
            controls={<TimeRangeToggle activeRange={range} onChange={setRange} />}
          />
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <Converter pair={series.pair} rate={series.snapshot.currentRate} />
          <div className="space-y-6">
            <TransferPlanningCard pair={series.pair} rate={series.snapshot.currentRate} />
            <AlertRuleForm pairSymbol={series.pair.symbol} />
          </div>
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
};
