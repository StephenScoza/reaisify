import { useState } from "react";
import { AlertRuleForm } from "../components/AlertRuleForm";
import { Converter } from "../components/Converter";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardFooter } from "../components/DashboardFooter";
import { ExchangeChart } from "../components/ExchangeChart";
import { ProviderUsageCard } from "../components/ProviderUsageCard";
import { RateCard } from "../components/RateCard";
import { SignalCard } from "../components/SignalCard";
import { SystemStatusStrip } from "../components/SystemStatusStrip";
import { TimeRangeToggle } from "../components/TimeRangeToggle";
import { useExchangeRates } from "../hooks/useExchangeRates";
import type { TimeRange } from "../types/currency";

const pairSymbol = "usd-brl";

export const Dashboard = () => {
  const [range, setRange] = useState<TimeRange>("30D");
  const { series, filteredPoints, isLoading, error } = useExchangeRates(pairSymbol, range);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 text-slate-200">
        Loading Currency Tracker...
      </main>
    );
  }

  if (error || !series) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
        <div className="rounded-[24px] border border-danger/30 bg-danger/10 p-6 text-danger">
          {error ?? "Unable to load exchange data."}
        </div>
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
          />
          <SignalCard signal={series.signal} />
        </div>

        <section className="min-w-0 space-y-4">
          <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-ink shadow-glow md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-ink">Historical context</h2>
              <p className="mt-1 text-sm text-slate-600">Zoom between tactical and long-range windows before deciding on a transfer.</p>
            </div>
            <TimeRangeToggle activeRange={range} onChange={setRange} />
          </div>
          <ExchangeChart
            points={filteredPoints}
            title={`${series.pair.base}/${series.pair.quote} rate path`}
            source={series.history.source}
          />
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <Converter pair={series.pair} rate={series.snapshot.currentRate} />
          <div className="space-y-6">
            <ProviderUsageCard />
            <AlertRuleForm pairSymbol={series.pair.symbol} />
          </div>
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
};
