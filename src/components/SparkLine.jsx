import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

function SparkLine({ data }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="score"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
        <Tooltip
          formatter={(value) => [`${value}`, "Score"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SparkLine;
