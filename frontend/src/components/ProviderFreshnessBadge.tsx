import { getProviderFreshness } from "../utils/providerFreshness";

interface ProviderFreshnessBadgeProps {
  source?: string;
}

const toneClasses = {
  fallback: "border-slate-200 bg-sand text-slatebrand",
  live: "border-mint/20 bg-surf text-mint",
  mock: "border-danger/20 bg-red-50 text-danger",
  official: "border-blue-200 bg-blue-50 text-blue-700",
};

export const ProviderFreshnessBadge = ({ source }: ProviderFreshnessBadgeProps) => {
  const freshness = getProviderFreshness(source);

  return (
    <span
      title={freshness.detail}
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[freshness.tone]}`}
    >
      {freshness.label}
    </span>
  );
};
