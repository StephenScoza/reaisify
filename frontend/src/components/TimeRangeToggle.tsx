import type { TimeRange } from "../types/currency";

const ranges: TimeRange[] = ["7D", "30D", "90D", "1Y"];

interface TimeRangeToggleProps {
  activeRange: TimeRange;
  onChange: (range: TimeRange) => void;
}

export const TimeRangeToggle = ({ activeRange, onChange }: TimeRangeToggleProps) => (
  <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
    {ranges.map((range) => (
      <button
        key={range}
        type="button"
        onClick={() => onChange(range)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          activeRange === range ? "bg-mint text-white" : "text-slate-600 hover:text-ink"
        }`}
      >
        {range}
      </button>
    ))}
  </div>
);
