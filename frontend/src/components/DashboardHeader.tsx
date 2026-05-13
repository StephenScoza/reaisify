import type { CurrencyPair } from "../types/currency";

interface DashboardHeaderProps {
  pair: CurrencyPair;
  updatedAt: string;
  source?: string;
}

export const DashboardHeader = ({ pair, updatedAt, source }: DashboardHeaderProps) => (
  <header className="relative max-w-full overflow-hidden rounded-2xl border border-white/10 bg-white p-6 text-ink shadow-glow xl:p-8">
    <div className="absolute inset-x-0 top-0 h-1 bg-mint" />
    <div className="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-2xl">
        <p className="mb-3 inline-flex max-w-full rounded-full border border-mint/20 bg-surf px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-mint">
          Dollars to Reais. Real simple.
        </p>
        <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">Reaisify</h1>
        <p className="mt-3 max-w-xl text-wrap text-sm leading-6 text-slate-600 md:text-base">
          Track smarter, spend better. Monitor {pair.base} to {pair.quote} trends and decide when a transfer into Brazil looks attractive.
        </p>
      </div>
      <div className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-sand px-4 py-3 text-sm text-slate-600 lg:w-auto lg:max-w-sm">
        <div className="font-semibold text-ink">{pair.displayName}</div>
        <div className="mt-1 [overflow-wrap:anywhere]">
          {pair.base}/{pair.quote} - Updated {new Date(updatedAt).toLocaleString()}
        </div>
        {source ? (
          <div className="mt-1 break-words text-xs font-semibold uppercase tracking-[0.16em] text-mint">Source: {source}</div>
        ) : null}
      </div>
    </div>
  </header>
);
