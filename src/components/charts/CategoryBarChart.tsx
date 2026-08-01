"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface CategoryPoint {
  label: string;
  value: number;
}

export function CategoryBarChart({
  data,
  color = "var(--chart-1)",
  height = 260,
  horizontal = false,
}: {
  data: CategoryPoint[];
  color?: string;
  height?: number;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 8, bottom: 0, left: horizontal ? 0 : -16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          horizontal={!horizontal}
          vertical={horizontal}
        />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={32}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: "var(--surface-2)" }}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--foreground)",
          }}
        />
        <Bar
          dataKey="value"
          fill={color}
          radius={[6, 6, 6, 6]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
