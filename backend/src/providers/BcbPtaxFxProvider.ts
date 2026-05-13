import type { FxHistory, FxLatest, FxPoint, TimeRange } from "../types/fx.js";
import type { FxProvider } from "./FxProvider.js";
import { buildPair } from "../utils/pairs.js";

const rangeToDays: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

interface BcbPtaxResponse {
  value?: BcbPtaxRow[];
}

interface BcbPtaxRow {
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
  tipoBoletim?: string;
}

const formatBcbDate = (date: Date) => {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${month}-${day}-${year}`;
};

const officialRate = (row: BcbPtaxRow) => (Number(row.cotacaoCompra) + Number(row.cotacaoVenda)) / 2;

const assertBrlQuotedPair = (pairSymbol: string) => {
  const pair = buildPair(pairSymbol);

  if (pair.quote !== "BRL") {
    throw new Error("BCB PTAX provider only supports pairs quoted in BRL.");
  }

  return pair;
};

const onePointPerDay = (rows: BcbPtaxRow[]): FxPoint[] => {
  const byDay = new Map<string, BcbPtaxRow>();

  rows.forEach((row) => {
    const day = new Date(row.dataHoraCotacao).toISOString().slice(0, 10);
    const current = byDay.get(day);
    const isClosing = row.tipoBoletim?.toLowerCase().includes("fechamento") ?? false;
    const currentIsClosing = current?.tipoBoletim?.toLowerCase().includes("fechamento") ?? false;

    if (!current || (isClosing && !currentIsClosing) || new Date(row.dataHoraCotacao) > new Date(current.dataHoraCotacao)) {
      byDay.set(day, row);
    }
  });

  return Array.from(byDay.entries())
    .map(([day, row]) => ({
      date: new Date(`${day}T00:00:00Z`).toISOString(),
      rate: officialRate(row),
    }))
    .filter((point) => Number.isFinite(point.rate))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export class BcbPtaxFxProvider implements FxProvider {
  readonly name = "bcb-ptax";
  private readonly baseUrl = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata";

  private async fetchRows(currency: string, from: Date, to: Date): Promise<BcbPtaxRow[]> {
    const params = new URLSearchParams({
      "@moeda": `'${currency}'`,
      "@dataInicial": `'${formatBcbDate(from)}'`,
      "@dataFinalCotacao": `'${formatBcbDate(to)}'`,
      "$format": "json",
    });
    const url = `${this.baseUrl}/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`BCB PTAX request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as BcbPtaxResponse;
    return payload.value ?? [];
  }

  async getLatestRate(pairSymbol: string): Promise<FxLatest> {
    const pair = assertBrlQuotedPair(pairSymbol);
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(to.getUTCDate() - 10);
    const points = onePointPerDay(await this.fetchRows(pair.base, from, to));
    const latest = points[points.length - 1];

    if (!latest) {
      throw new Error(`BCB PTAX did not return a latest rate for ${pair.displayName}.`);
    }

    return {
      pair,
      rate: latest.rate,
      timestamp: latest.date,
      source: this.name,
    };
  }

  async getHistoricalRates(pairSymbol: string, range: TimeRange): Promise<FxHistory> {
    const pair = assertBrlQuotedPair(pairSymbol);
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(to.getUTCDate() - rangeToDays[range] - 7);
    const points = onePointPerDay(await this.fetchRows(pair.base, from, to)).slice(-rangeToDays[range]);

    if (points.length === 0) {
      throw new Error(`BCB PTAX did not return historical rates for ${pair.displayName}.`);
    }

    return {
      pair,
      points,
      range,
      source: this.name,
      updatedAt: new Date().toISOString(),
    };
  }
}
