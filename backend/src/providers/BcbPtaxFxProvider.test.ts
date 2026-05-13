import { afterEach, describe, expect, it, vi } from "vitest";
import { BcbPtaxFxProvider } from "./BcbPtaxFxProvider.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BcbPtaxFxProvider", () => {
  it("uses one official PTAX point per day for historical USD/BRL data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            value: [
              {
                cotacaoCompra: 5.01,
                cotacaoVenda: 5.03,
                dataHoraCotacao: "2026-05-11 13:08:00.000",
                tipoBoletim: "Fechamento",
              },
              {
                cotacaoCompra: 5.08,
                cotacaoVenda: 5.1,
                dataHoraCotacao: "2026-05-12 13:05:00.000",
                tipoBoletim: "Fechamento",
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const history = await new BcbPtaxFxProvider().getHistoricalRates("usd-brl", "7D");

    expect(history.source).toBe("bcb-ptax");
    expect(history.points).toEqual([
      {
        date: "2026-05-11T00:00:00.000Z",
        rate: 5.02,
      },
      {
        date: "2026-05-12T00:00:00.000Z",
        rate: 5.09,
      },
    ]);
  });

  it("rejects pairs that are not quoted in BRL", async () => {
    await expect(new BcbPtaxFxProvider().getLatestRate("usd-eur")).rejects.toThrow(
      "only supports pairs quoted in BRL",
    );
  });
});
