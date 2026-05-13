import { useState } from "react";
import type { SignalAssessment } from "../types/currency";
import { Icon } from "./Icon";
import { InfoPopover } from "./InfoPopover";

interface SignalCardProps {
  signal: SignalAssessment;
}

const palette = {
  GOOD: "bg-surf text-mint border-mint/25",
  NEUTRAL: "bg-sand text-slatebrand border-slate-200",
  WAIT: "bg-red-50 text-danger border-danger/25",
};

const explainPercentile = (percentile: number) => {
  const rounded = Math.round(percentile * 100);
  if (rounded >= 75) {
    return `The current rate is stronger than about ${rounded}% of recent observations, which favors converting.`;
  }

  if (rounded < 40) {
    return `The current rate is only stronger than about ${rounded}% of recent observations, so patience may help.`;
  }

  return `The current rate is near the middle of the recent range at about the ${rounded}th percentile.`;
};

const explainAverageGap = (gap: number) =>
  gap >= 0
    ? `The spot rate is ${gap.toFixed(4)} above its 30-day average, a positive timing signal.`
    : `The spot rate is ${Math.abs(gap).toFixed(4)} below its 30-day average, which weakens the setup.`;

const explainMomentum = (momentum: number) => {
  const percent = (momentum * 100).toFixed(2);
  if (momentum > 0.012) {
    return `Short-term momentum is improving at ${percent}%, which supports a stronger signal.`;
  }

  if (momentum < -0.012) {
    return `Short-term momentum is softening at ${percent}%, so the model is more cautious.`;
  }

  return `Momentum is mostly flat at ${percent}%, so the signal leans more on range and average position.`;
};

export const SignalCard = ({ signal }: SignalCardProps) => {
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  return (
  <section className="max-w-full overflow-visible rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
    <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surf p-2 text-mint">
            <Icon name="spark" className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Signal Engine</p>
          <InfoPopover label="Explain signal engine" title="How the signal works">
            Reaisify compares the current rate to recent averages, range percentile, and momentum to estimate timing quality.
          </InfoPopover>
        </div>
        <div className="mt-3 flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
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

      <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-sand p-4 md:w-auto md:min-w-40">
        <div className="text-sm text-slate-500">Confidence</div>
        <div className="mt-2 text-3xl font-bold text-ink">{signal.confidence}%</div>
      </div>
    </div>

    <p className="mt-5 text-sm leading-6 text-slate-600">{signal.reasoning}</p>

    <div className="mt-4 rounded-xl border border-slate-200 bg-sand">
      <button
        type="button"
        onClick={() => setIsExplainerOpen((isOpen) => !isOpen)}
        aria-expanded={isExplainerOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:text-mint focus:outline-none focus:ring-2 focus:ring-inset focus:ring-mint/30"
      >
        <span>Why this signal?</span>
        <Icon
          name="chevronUp"
          className={`h-4 w-4 text-mint transition-transform ${isExplainerOpen ? "" : "rotate-180"}`}
        />
      </button>
      {isExplainerOpen ? (
        <div className="space-y-2 px-4 pb-4 text-sm leading-6 text-slate-600">
        <p>{explainPercentile(signal.percentile)}</p>
        <p>{explainAverageGap(signal.movingAverageGap)}</p>
        <p>{explainMomentum(signal.momentum)}</p>
      </div>
      ) : null}
    </div>

    <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="min-w-0 rounded-xl border border-slate-200 bg-sand p-4">
        <div className="text-sm text-slate-500">Percentile</div>
        <div className="mt-2 text-xl font-semibold text-ink">{Math.round(signal.percentile * 100)}th</div>
      </div>
      <div className="min-w-0 rounded-xl border border-slate-200 bg-sand p-4">
        <div className="text-sm text-slate-500">30D Gap</div>
        <div className="mt-2 text-xl font-semibold text-ink">{signal.movingAverageGap.toFixed(4)}</div>
      </div>
      <div className="min-w-0 rounded-xl border border-slate-200 bg-sand p-4">
        <div className="text-sm text-slate-500">Momentum</div>
        <div className="mt-2 text-xl font-semibold text-ink">{(signal.momentum * 100).toFixed(2)}%</div>
      </div>
    </div>
  </section>
  );
};
