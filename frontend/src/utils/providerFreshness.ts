export type ProviderFreshnessTone = "live" | "official" | "fallback" | "mock";

interface ProviderFreshness {
  label: string;
  detail: string;
  tone: ProviderFreshnessTone;
}

const providerDetails: Record<string, ProviderFreshness> = {
  "awesomeapi": {
    label: "Brazil live fallback",
    detail: "Brazil-focused market feed",
    tone: "fallback",
  },
  "bcb-ptax": {
    label: "Official daily reference",
    detail: "Banco Central do Brasil PTAX",
    tone: "official",
  },
  "currency-api": {
    label: "Daily fallback",
    detail: "Keyless currency fallback",
    tone: "fallback",
  },
  "exchange-rate-api": {
    label: "Daily fallback",
    detail: "Keyless latest-rate fallback",
    tone: "fallback",
  },
  "frankfurter": {
    label: "Daily market fallback",
    detail: "Free historical exchange data",
    tone: "fallback",
  },
  "fxapi-app": {
    label: "Market fallback",
    detail: "Keyless latest/history fallback",
    tone: "fallback",
  },
  "mock": {
    label: "Mock data",
    detail: "Local development fallback",
    tone: "mock",
  },
  "twelve-data": {
    label: "Near real-time",
    detail: "Primary live FX provider",
    tone: "live",
  },
};

const normalizeSource = (source?: string) => source?.replace("-derived", "") ?? "mock";

export const getProviderFreshness = (source?: string): ProviderFreshness => {
  const normalized = normalizeSource(source);
  const base = providerDetails[normalized] ?? {
    label: "Provider data",
    detail: source ?? "Unknown source",
    tone: "fallback" as ProviderFreshnessTone,
  };

  if (source?.includes("-derived")) {
    return {
      ...base,
      label: `${base.label} cache`,
      detail: `${base.detail}; derived from cached history`,
    };
  }

  return base;
};
