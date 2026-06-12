import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RANGES = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "All", days: null },
];

function formatTick(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function tickInterval(length) {
  if (length <= 8) return 0;
  return Math.floor(length / 6);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-date">{formatTick(label)}</p>
      <p className="chart-tooltip-value">
        <span className="chart-tooltip-dot" />
        {payload[0].value}
        <span className="chart-tooltip-unit">/100</span>
      </p>
    </div>
  );
}

function HistoryChart({ id }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("3M");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/trends/${id}/history`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [id]);

  const filtered = useMemo(() => {
    const r = RANGES.find((r) => r.label === range);
    if (!r.days) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - r.days);
    return data.filter((d) => new Date(d.date) >= cutoff);
  }, [data, range]);

  return (
    <div className="history-chart">
      <div className="chart-header">
        <span className="chart-section-title">Score history</span>
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button
              key={r.label}
              className={`range-tab${range === r.label ? " active" : ""}`}
              onClick={() => setRange(r.label)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="chart-placeholder-full">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      ) : filtered.length < 2 ? (
        <div className="chart-placeholder-full">
          <p className="empty-label">Not enough data for this range</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={filtered}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatTick}
              interval={tickInterval(filtered.length)}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickCount={5}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#histGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default HistoryChart;
