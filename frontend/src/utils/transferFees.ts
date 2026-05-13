import type { TransferFeeEstimate, TransferFeeRule } from "../types/currency";

export const transferFeeRules: TransferFeeRule[] = [
  {
    id: "wise-estimate",
    providerName: "Wise estimate",
    model: "PERCENTAGE_PLUS_FIXED",
    description: "Transparent fee-style estimate. Replace with live Wise quote API data later.",
    fixedFeeUsd: 1.25,
    percentageFee: 0.009,
    exchangeRateMarkup: 0,
    estimatedDelivery: "Minutes to 1 business day",
    isLiveQuote: false,
  },
  {
    id: "remittance-app-estimate",
    providerName: "Remittance app",
    model: "PERCENTAGE_PLUS_FIXED",
    description: "Typical app transfer estimate with a small fee and light FX spread.",
    fixedFeeUsd: 2.99,
    percentageFee: 0.006,
    exchangeRateMarkup: 0.006,
    estimatedDelivery: "Same day to 2 business days",
    isLiveQuote: false,
  },
  {
    id: "bank-wire-estimate",
    providerName: "Bank wire",
    model: "BANK_SPREAD",
    description: "Conservative bank wire scenario with a fixed fee and wider exchange spread.",
    fixedFeeUsd: 35,
    percentageFee: 0,
    exchangeRateMarkup: 0.025,
    estimatedDelivery: "1 to 3 business days",
    isLiveQuote: false,
  },
];

export const estimateTransferFees = (
  amountUsd: number,
  marketRate: number,
  rules: TransferFeeRule[] = transferFeeRules,
): TransferFeeEstimate[] =>
  rules
    .map((rule) => {
      const variableFee = amountUsd * rule.percentageFee;
      const feeUsd = Math.min(amountUsd, rule.fixedFeeUsd + variableFee);
      const netAmountUsd = Math.max(0, amountUsd - feeUsd);
      const effectiveRate = marketRate * (1 - rule.exchangeRateMarkup);
      const recipientAmountBrl = netAmountUsd * effectiveRate;

      return {
        rule,
        sendAmountUsd: amountUsd,
        feeUsd,
        effectiveRate,
        netAmountUsd,
        recipientAmountBrl,
        totalCostUsd: amountUsd,
      };
    })
    .sort((a, b) => b.recipientAmountBrl - a.recipientAmountBrl);
