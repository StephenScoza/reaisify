import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProviderUsageSnapshot } from "../types/fx.js";
import { readJsonFile, writeJsonFile } from "./fileStore.js";
import { shouldReserveTwelveDataCredits } from "./providerUsageService.js";

vi.mock("./fileStore.js", () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(async (_fileName: string, data: unknown) => data),
}));

const usageSnapshot = (creditsLeft?: number): ProviderUsageSnapshot => ({
  providerName: "twelve-data",
  source: "response-headers",
  updatedAt: "2026-01-01T00:00:00.000Z",
  apiCreditsUsed: creditsLeft === undefined ? undefined : 8 - creditsLeft,
  apiCreditsLeft: creditsLeft,
  apiCreditLimit: creditsLeft === undefined ? undefined : 8,
});

describe("shouldReserveTwelveDataCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TWELVE_DATA_CREDIT_RESERVE;
  });

  it("reserves Twelve Data when known credits are at the configured reserve", async () => {
    vi.mocked(readJsonFile).mockResolvedValue(usageSnapshot(2));
    process.env.TWELVE_DATA_CREDIT_RESERVE = "2";

    await expect(shouldReserveTwelveDataCredits()).resolves.toBe(true);
  });

  it("allows Twelve Data when credits remain above the reserve", async () => {
    vi.mocked(readJsonFile).mockResolvedValue(usageSnapshot(3));
    process.env.TWELVE_DATA_CREDIT_RESERVE = "2";

    await expect(shouldReserveTwelveDataCredits()).resolves.toBe(false);
  });

  it("does not reserve when usage is unknown or the reserve is disabled", async () => {
    vi.mocked(readJsonFile).mockResolvedValue(usageSnapshot(undefined));
    await expect(shouldReserveTwelveDataCredits()).resolves.toBe(false);

    process.env.TWELVE_DATA_CREDIT_RESERVE = "0";
    await expect(shouldReserveTwelveDataCredits()).resolves.toBe(false);
    expect(writeJsonFile).not.toHaveBeenCalled();
  });
});
