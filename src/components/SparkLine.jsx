import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";

function SparkLine({ data }) {
  return (
    <ResponsiveContainer width="100%" height={72}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="score"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#sparkGrad)"
          dot={false}
          activeDot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
        />
        <Tooltip
          contentStyle={{
            background: "#181d2c",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#f1f5f9",
            padding: "6px 10px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
          itemStyle={{ color: "#10b981" }}
          labelStyle={{ color: "#64748b", marginBottom: "2px" }}
          formatter={(v) => [v, "Score"]}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default SparkLine;
