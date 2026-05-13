import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import type { FxPoint } from "../types/currency";
import { formatDate, formatRate } from "../utils/formatters";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";

interface ExchangeChartProps {
  points: FxPoint[];
  title?: string;
  source?: string;
  updatedAt?: string;
  controls?: ReactNode;
}

const formatUpdatedAt = (value?: string) =>
  value ? new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Unknown";

export const ExchangeChart = ({ points, title = "USD/BRL rate path", source, updatedAt, controls }: ExchangeChartProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Historical context</h2>
        <p className="mt-1 text-sm text-slate-600">Zoom between tactical and long-range windows before deciding on a transfer.</p>
      </div>
      {controls}
    </div>

    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surf p-2 text-mint">
            <Icon name="chart" className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Historical Trend</p>
        </div>
        <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="rounded-full border border-slate-200 bg-sand px-3 py-1 text-sm font-medium text-slate-600">
          {source?.includes("derived") ? "Cached range" : "Provider range"}
        </div>
        <div className="rounded-full border border-slate-200 bg-sand px-3 py-1 text-sm font-medium text-slate-600">
          Updated {formatUpdatedAt(updatedAt)}
        </div>
      </div>
    </div>

    {points.length === 0 ? (
      <EmptyState
        title="No chart data yet"
        message="Reaisify could not find historical points for this range. Try another range or refresh the backend provider cache."
      />
    ) : (
      <div className="h-80 w-full min-w-0">
        <ResponsiveContainer>
          <AreaChart data={points}>
            <defs>
              <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(100,116,139,0.18)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#64748B"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["dataMin - 0.05", "dataMax + 0.05"]}
              tickFormatter={formatRate}
              stroke="#64748B"
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              color: "#0D1B2A",
            }}
              formatter={(value: number) => [`R$ ${formatRate(value)}`, "BRL per USD"]}
              labelFormatter={(label) => formatDate(String(label))}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#16A34A"
              strokeWidth={3}
              fill="url(#rateFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </section>
);
