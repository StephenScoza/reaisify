import { useMemo, useState } from "react";
import type { CurrencyPair } from "../types/currency";
import { formatCurrency, formatRate, formatSignedNumber } from "../utils/formatters";
import { Icon } from "./Icon";
import { InfoPopover } from "./InfoPopover";

interface TransferPlanningCardProps {
  pair: CurrencyPair;
  rate: number;
}

export const TransferPlanningCard = ({ pair, rate }: TransferPlanningCardProps) => {
  const [plannedAmount, setPlannedAmount] = useState("5000");
  const [targetRate, setTargetRate] = useState((rate + 0.1).toFixed(4));

  const amount = Math.max(0, Number(plannedAmount) || 0);
  const target = Math.max(0, Number(targetRate) || 0);

  const plan = useMemo(() => {
    const todayValue = amount * rate;
    const targetValue = amount * target;
    const difference = targetValue - todayValue;
    const percentLift = rate > 0 ? ((target - rate) / rate) * 100 : 0;

    return {
      todayValue,
      targetValue,
      difference,
      percentLift,
    };
  }, [amount, rate, target]);

  const isTargetBetter = plan.difference > 0;
  const isTargetWorse = plan.difference < 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surf p-2 text-mint">
              <Icon name="spark" className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Transfer Planning</p>
            <InfoPopover label="Explain transfer planning" title="Scenario planning">
              Compare today's rate with your target rate before committing a larger transfer. This does not include provider fees.
            </InfoPopover>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-ink">What waiting could be worth</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Model the upside or downside of waiting for a target {pair.base}/{pair.quote} rate.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slatebrand">
          Rate target
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-600">{pair.base} to move</span>
          <input
            type="number"
            min="0"
            value={plannedAmount}
            onChange={(event) => setPlannedAmount(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-sand px-4 py-3 text-lg text-ink outline-none transition focus:border-mint/60"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-600">Target rate</span>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={targetRate}
            onChange={(event) => setTargetRate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-sand px-4 py-3 text-lg text-ink outline-none transition focus:border-mint/60"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Convert today at {formatRate(rate)}</div>
          <div className="mt-2 text-2xl font-bold text-ink">
            {formatCurrency(plan.todayValue, pair.quote, "pt-BR")}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-sand p-4">
          <div className="text-xs text-slate-500">Convert at target {formatRate(target)}</div>
          <div className="mt-2 text-2xl font-bold text-ink">
            {formatCurrency(plan.targetValue, pair.quote, "pt-BR")}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 rounded-2xl border px-4 py-4 ${
          isTargetBetter
            ? "border-mint/20 bg-surf"
            : isTargetWorse
              ? "border-danger/30 bg-danger/10"
              : "border-slate-200 bg-sand"
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slatebrand">Difference</div>
        <div className={`mt-2 text-3xl font-bold ${isTargetWorse ? "text-danger" : "text-ink"}`}>
          {formatCurrency(plan.difference, pair.quote, "pt-BR")}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isTargetBetter
            ? `Waiting for ${formatRate(target)} adds ${formatCurrency(plan.difference, pair.quote, "pt-BR")} before fees.`
            : isTargetWorse
              ? `That target is below today's rate, reducing proceeds by ${formatCurrency(Math.abs(plan.difference), pair.quote, "pt-BR")} before fees.`
              : "Your target matches today's rate, so the scenario is neutral before fees."}
        </p>
        <div className="mt-3 text-xs font-semibold text-slatebrand">
          Target move: {formatSignedNumber(plan.percentLift, 2)}%
        </div>
      </div>
    </section>
  );
};
