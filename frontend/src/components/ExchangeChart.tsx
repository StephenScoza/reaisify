import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FxPoint } from "../types/currency";
import { formatDate, formatRate } from "../utils/formatters";

interface ExchangeChartProps {
  points: FxPoint[];
  title?: string;
  source?: string;
}

export const ExchangeChart = ({ points, title = "USD/BRL rate path", source }: ExchangeChartProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Historical Trend</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
      </div>
      <div className="rounded-full border border-slate-200 bg-sand px-3 py-1 text-sm font-medium text-slate-600">
        {source?.includes("derived") ? "Cached range" : "Live range"}
      </div>
    </div>

    <div className="h-80 w-full">
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
            formatter={(value: number) => [formatRate(value), "Rate"]}
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
  </section>
);
