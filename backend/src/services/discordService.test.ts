import { describe, expect, it } from "vitest";
import type { AlertRule, FxLatest, FxPoint, SignalAssessment } from "../types/fx.js";
import { buildChartUrl, buildDiscordPayload } from "./discordService.js";

const alertFixture: AlertRule = {
  id: "alert-1",
  pairSymbol: "usd-brl",
  targetRate: 5.4,
  createdAt: "2026-05-19T12:00:00.000Z",
  updatedAt: "2026-05-19T12:00:00.000Z",
  isActive: true,
  lastObservedState: "BELOW",
};

const latestFixture: FxLatest = {
  pair: {
    base: "USD",
    quote: "BRL",
    symbol: "usd-brl",
    displayName: "USD to BRL",
  },
  rate: 5.45,
  timestamp: "2026-05-19T12:05:00.000Z",
  source: "twelve-data",
};

const signalFixture: SignalAssessment = {
  recommendation: "GOOD",
  confidence: 78,
  reasoning: "Current rate sits in the upper quartile of the recent range.",
  trendDirection: "UP",
  percentile: 0.78,
  movingAverageGap: 0.04,
  momentum: 0.01,
};

const chartPoints: FxPoint[] = [
  { date: "2026-05-17T00:00:00.000Z", rate: 5.35 },
  { date: "2026-05-18T00:00:00.000Z", rate: 5.4 },
  { date: "2026-05-19T00:00:00.000Z", rate: 5.45 },
];

describe("discordService payload builders", () => {
  it("builds a professional Discord embed with core alert context", () => {
    const payload = buildDiscordPayload(alertFixture, latestFixture, signalFixture, chartPoints);
    const [embed] = payload.embeds;

    expect(payload.username).toBe("Reaisify");
    expect(embed.title).toBe("USD/BRL opportunity alert");
    expect(embed.description).toContain("Good time to convert");
    expect(embed.description).toContain(signalFixture.reasoning);
    expect(embed.color).toBe(0x16a34a);
    expect(embed.fields).toEqual(
      expect.arrayContaining([
        { name: "Current rate", value: "5.4500", inline: true },
        { name: "Target rate", value: "5.4000", inline: true },
        { name: "Confidence", value: "78%", inline: true },
        { name: "Provider", value: "twelve-data", inline: true },
      ]),
    );
    expect(embed.image?.url).toContain("quickchart.io/chart");
  });

  it("encodes a chart URL with BRL axis formatting", () => {
    const chartUrl = buildChartUrl(chartPoints);
    const config = JSON.parse(decodeURIComponent(new URL(chartUrl).searchParams.get("c") ?? ""));

    expect(config.type).toBe("line");
    expect(config.data.datasets[0].label).toBe("USD/BRL");
    expect(config.data.datasets[0].data).toEqual([5.35, 5.4, 5.45]);
    expect(config.options.scales.y.ticks.callback).toContain("R$");
  });
});
