import type { FxSnapshot } from "../types/currency";
import { formatPercent, formatRate, formatSignedNumber } from "../utils/formatters";

interface RateCardProps {
  snapshot: FxSnapshot;
  base: string;
  quote: string;
}

export const RateCard = ({ snapshot, base, quote }: RateCardProps) => {
  const positive = snapshot.change.amount >= 0;

  return (
    <section className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Current Exchange Rate</p>
          <h2 className="mt-3 text-4xl font-bold text-ink">{formatRate(snapshot.currentRate)}</h2>
          <p className="mt-2 text-sm text-slate-600">1 {base} buys this many {quote}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
            positive ? "bg-surf text-mint" : "bg-red-50 text-danger"
          }`}
        >
          {positive ? "Improving" : "Pulling back"}
        </span>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-sm text-slate-500">Daily Change</div>
          <div className={`mt-2 text-xl font-semibold ${positive ? "text-mint" : "text-danger"}`}>
            {formatSignedNumber(snapshot.change.amount)}
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-sm text-slate-500">% Change</div>
          <div className={`mt-2 text-xl font-semibold ${positive ? "text-mint" : "text-danger"}`}>
            {formatPercent(snapshot.change.percentage)}
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-sm text-slate-500">Visible Range</div>
          <div className="mt-2 break-words text-xl font-semibold text-ink">
            {formatRate(snapshot.low)} - {formatRate(snapshot.high)}
          </div>
        </div>
      </div>
    </section>
  );
};
