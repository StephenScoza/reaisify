import { afterEach, describe, expect, it, vi } from "vitest";
import { AwesomeApiFxProvider } from "./AwesomeApiFxProvider.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AwesomeApiFxProvider", () => {
  it("maps latest USD/BRL responses into the common FX shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            USDBRL: {
              bid: "5.1000",
              ask: "5.1200",
              timestamp: "1778688000",
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const latest = await new AwesomeApiFxProvider().getLatestRate("usd-brl");

    expect(latest.rate).toBeCloseTo(5.11);
    expect(latest.source).toBe("awesomeapi");
    expect(latest.pair.displayName).toBe("USD to BRL");
  });
});
