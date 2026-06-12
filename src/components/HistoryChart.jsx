import { useState, useMemo, useEffect } from "react";
import { API_URL } from "../config";
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
    fetch(`${API_URL}/api/trends/${id}/history`)
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
                <stop offset="0%" stopColor="#be3b2c" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#be3b2c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(28,26,23,0.14)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatTick}
              interval={tickInterval(filtered.length)}
              tick={{ fill: "#a89c8d", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(28,26,23,0.4)" }}
            />
            <YAxis
              domain={[0, 100]}
              tickCount={5}
              tick={{ fill: "#a89c8d", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#be3b2c"
              strokeWidth={2.5}
              fill="url(#histGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#be3b2c", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default HistoryChart;
