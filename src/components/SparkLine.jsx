import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";

function SparkLine({ data }) {
  return (
    <ResponsiveContainer width="100%" height={72}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#be3b2c" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#be3b2c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="score"
          stroke="#be3b2c"
          strokeWidth={2}
          fill="url(#sparkGrad)"
          dot={false}
          activeDot={{ r: 3, fill: "#be3b2c", strokeWidth: 0 }}
        />
        <Tooltip
          contentStyle={{
            background: "#1c1a17",
            border: "1px solid #1c1a17",
            borderRadius: "2px",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#fbf8f1",
            padding: "6px 10px",
          }}
          itemStyle={{ color: "#be3b2c" }}
          labelStyle={{ color: "#a89c8d", marginBottom: "2px" }}
          formatter={(v) => [v, "Score"]}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default SparkLine;
