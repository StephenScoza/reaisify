import { useMemo, useState } from "react";
import type { CurrencyPair } from "../types/currency";
import { formatCurrency, formatPercent, formatRate } from "../utils/formatters";
import { estimateTransferFees } from "../utils/transferFees";
import { AnimatedNumber } from "./AnimatedNumber";
import { Icon } from "./Icon";
import { InfoPopover } from "./InfoPopover";

interface ConverterProps {
  pair: CurrencyPair;
  rate: number;
}

export const Converter = ({ pair, rate }: ConverterProps) => {
  const [baseAmount, setBaseAmount] = useState("1000");
  const [customFeePercent, setCustomFeePercent] = useState("1.00");
  const [customFixedFee, setCustomFixedFee] = useState("0");

  const numericAmount = Number(baseAmount) || 0;
  const numericCustomFeePercent = Math.max(0, Number(customFeePercent) || 0);
  const numericCustomFixedFee = Math.max(0, Number(customFixedFee) || 0);
  const convertedAmount = useMemo(() => numericAmount * rate, [rate, numericAmount]);
  const feeEstimates = useMemo(
    () => estimateTransferFees(numericAmount, rate),
    [numericAmount, rate],
  );
  const bestEstimate = feeEstimates[0];
  const formatSpread = (markup: number) => (markup === 0 ? "0.00%" : formatPercent(-markup * 100));
  const customFeeUsd = Math.min(
    numericAmount,
    numericCustomFixedFee + numericAmount * (numericCustomFeePercent / 100),
  );
  const customRecipientAmount = Math.max(0, numericAmount - customFeeUsd) * rate;

  return (
    <section className="max-w-full overflow-visible rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surf p-2 text-mint">
              <Icon name="dollar" className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Conversion Calculator</p>
          </div>
          <h3 className="mt-2 text-xl font-semibold text-ink">Estimate your transfer outcome</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Model a transfer using the latest backend-proxied {pair.base}/{pair.quote} rate.
          </p>
        </div>
        {bestEstimate ? (
          <div className="rounded-full border border-mint/20 bg-surf px-3 py-1 text-sm font-semibold text-mint">
            Best estimate: {bestEstimate.rule.providerName}
          </div>
        ) : null}
      </div>

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
            <AnimatedNumber
              value={convertedAmount}
              formatter={(value) => formatCurrency(value, pair.quote, "pt-BR")}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-sand p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white p-2 text-mint">
                <Icon name="wallet" className="h-4 w-4" />
              </span>
              <div className="text-sm font-semibold text-ink">Transfer fee estimates</div>
              <InfoPopover label="Explain transfer fee estimates" title="Fee estimate inputs">
              Presets combine fixed fees, percentage fees, and FX spread assumptions. Use your own fee when you have a real quote.
              </InfoPopover>
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              {feeEstimates.length} estimate presets: {feeEstimates.map((estimate) => estimate.rule.providerName).join(", ")}.
              Provider fees and FX spreads can change before a real transfer quote.
            </div>
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slatebrand">
            Ranked by BRL received
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-mint/20 bg-surf p-4">
          <div className="min-w-0">
            <div>
              <div className="text-sm font-semibold text-ink">Use your own fee</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Enter a provider's fee to compare a real quote against the estimates below.
              </p>
            </div>

            <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(180px,1.25fr)] md:items-end">
            <label className="block min-w-0">
              <span className="mb-2 block text-xs text-slate-600">Percent fee</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customFeePercent}
                onChange={(event) => setCustomFeePercent(event.target.value)}
                className="w-full rounded-xl border border-mint/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-mint"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-2 block text-xs text-slate-600">Fixed fee USD</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customFixedFee}
                onChange={(event) => setCustomFixedFee(event.target.value)}
                className="w-full rounded-xl border border-mint/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-mint"
              />
            </label>
            <div className="min-w-0 rounded-xl bg-white px-4 py-3">
              <div className="text-xs text-slate-500">Custom arrives</div>
              <div className="mt-1 break-words text-lg font-bold text-ink">
                <AnimatedNumber
                  value={customRecipientAmount}
                  formatter={(value) => formatCurrency(value, pair.quote, "pt-BR")}
                />
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fee: {formatCurrency(customFeeUsd, pair.base)}
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {feeEstimates.map((estimate, index) => (
            <div
              key={estimate.rule.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{estimate.rule.providerName}</span>
                    {index === 0 ? (
                      <span className="rounded-full bg-surf px-2 py-0.5 text-xs font-semibold text-mint">
                        Most BRL
                      </span>
                    ) : null}
                    {!estimate.rule.isLiveQuote ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Estimate
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{estimate.rule.description}</p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <div className="text-lg font-bold text-ink">
                    {formatCurrency(estimate.recipientAmountBrl, pair.quote, "pt-BR")}
                  </div>
                  <div className="text-xs text-slate-500">arrives after fees</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg bg-sand px-3 py-2">
                  <div className="text-xs text-slate-500">Fee</div>
                  <div className="font-semibold text-ink">{formatCurrency(estimate.feeUsd, pair.base)}</div>
                </div>
                <div className="rounded-lg bg-sand px-3 py-2">
                  <div className="text-xs text-slate-500">Effective rate</div>
                  <div className="font-semibold text-ink">{formatRate(estimate.effectiveRate)}</div>
                </div>
                <div className="rounded-lg bg-sand px-3 py-2">
                  <div className="text-xs text-slate-500">FX spread</div>
                  <div className="font-semibold text-ink">{formatSpread(estimate.rule.exchangeRateMarkup)}</div>
                </div>
                <div className="rounded-lg bg-sand px-3 py-2">
                  <div className="text-xs text-slate-500">Delivery</div>
                  <div className="font-semibold text-ink">{estimate.rule.estimatedDelivery}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
