import { useMemo, useState } from "react";
import type { CurrencyPair } from "../types/currency";
import { formatCurrency, formatRate } from "../utils/formatters";

interface ConverterProps {
  pair: CurrencyPair;
  rate: number;
}

export const Converter = ({ pair, rate }: ConverterProps) => {
  const [baseAmount, setBaseAmount] = useState("1000");

  const numericAmount = Number(baseAmount) || 0;
  const convertedAmount = useMemo(() => numericAmount * rate, [rate, numericAmount]);

  return (
    <section className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Conversion Calculator</p>
      <h3 className="mt-2 text-xl font-semibold text-ink">Estimate your transfer outcome</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Model a transfer using the latest backend-proxied {pair.base}/{pair.quote} rate.
      </p>

      <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end">
        <label className="block min-w-0">
          <span className="mb-2 block text-sm text-slate-600">{pair.base} amount</span>
          <input
            type="number"
            min="0"
            value={baseAmount}
            onChange={(event) => setBaseAmount(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-sand px-4 py-3 text-lg text-ink outline-none transition placeholder:text-slate-400 focus:border-mint/60"
            placeholder="Enter USD amount"
          />
        </label>
        <div className="pb-3 text-center text-sm text-slate-500">@ {formatRate(rate)}</div>
        <div className="min-w-0 rounded-xl border border-mint/20 bg-surf p-4">
          <div className="text-sm text-slate-600">{pair.quote} equivalent</div>
          <div className="mt-2 break-words text-3xl font-bold text-ink">
            {formatCurrency(convertedAmount, pair.quote, "pt-BR")}
          </div>
        </div>
      </div>
    </section>
  );
};
