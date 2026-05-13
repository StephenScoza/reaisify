import { afterEach, describe, expect, it, vi } from "vitest";
import { ExchangeRateApiProvider } from "./ExchangeRateApiProvider.js";
import { FawazCurrencyApiProvider } from "./FawazCurrencyApiProvider.js";
import { FxApiAppProvider } from "./FxApiAppProvider.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("keyless FX providers", () => {
  it("maps ExchangeRate-API latest rates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            result: "success",
            time_last_update_utc: "Wed, 13 May 2026 00:00:00 +0000",
            rates: { BRL: 5.12 },
          }),
          { status: 200 },
        ),
      ),
    );

    const latest = await new ExchangeRateApiProvider().getLatestRate("usd-brl");

    expect(latest.rate).toBe(5.12);
    expect(latest.source).toBe("exchange-rate-api");
  });

  it("maps Fawaz Currency API latest rates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            date: "2026-05-13",
            brl: 5.13,
          }),
          { status: 200 },
        ),
      ),
    );

    const latest = await new FawazCurrencyApiProvider().getLatestRate("usd-brl");

    expect(latest.rate).toBe(5.13);
    expect(latest.source).toBe("currency-api");
  });

  it("maps fxapi.app historical rates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            rates: [
              { date: "2026-05-12", rate: 5.1 },
              { date: "2026-05-13", rate: 5.2 },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const history = await new FxApiAppProvider().getHistoricalRates("usd-brl", "7D");

    expect(history.source).toBe("fxapi-app");
    expect(history.points).toHaveLength(2);
    expect(history.points[1].rate).toBe(5.2);
  });
});
