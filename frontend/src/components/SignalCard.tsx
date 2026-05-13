import type { SignalAssessment } from "../types/currency";

interface SignalCardProps {
  signal: SignalAssessment;
}

const palette = {
  GOOD: "bg-surf text-mint border-mint/25",
  NEUTRAL: "bg-sand text-slatebrand border-slate-200",
  WAIT: "bg-red-50 text-danger border-danger/25",
};

export const SignalCard = ({ signal }: SignalCardProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Signal Engine</p>
        <div className="mt-3 flex items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${palette[signal.recommendation]}`}>
            {signal.recommendation === "GOOD"
              ? "Good time to convert"
              : signal.recommendation === "WAIT"
                ? "Wait for a better window"
                : "Neutral timing"}
          </span>
          <span className="text-sm text-slate-600">{signal.trendDirection} trend</span>
        </div>
      </div>

      <div className="min-w-40 rounded-xl border border-slate-200 bg-sand p-4">
        <div className="text-sm text-slate-500">Confidence</div>
        <div className="mt-2 text-3xl font-bold text-ink">{signal.confidence}%</div>
      </div>
    </div>

    <p className="mt-5 text-sm leading-6 text-slate-600">{signal.reasoning}</p>

    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-sand p-4">
        <div className="text-sm text-slate-500">Percentile</div>
        <div className="mt-2 text-xl font-semibold text-ink">{Math.round(signal.percentile * 100)}th</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-sand p-4">
        <div className="text-sm text-slate-500">30D Gap</div>
        <div className="mt-2 text-xl font-semibold text-ink">{signal.movingAverageGap.toFixed(4)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-sand p-4">
        <div className="text-sm text-slate-500">Momentum</div>
        <div className="mt-2 text-xl font-semibold text-ink">{(signal.momentum * 100).toFixed(2)}%</div>
      </div>
    </div>
  </section>
);
