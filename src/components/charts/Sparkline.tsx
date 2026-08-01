"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({
  data,
  color = "var(--chart-1)",
  height = 44,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const points = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={points}
        margin={{ top: 4, right: 2, bottom: 0, left: 2 }}
      >
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
