import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  data: any[];
  dataKey?: string;
  nameKey?: string;
  currentHour?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value: number = payload[0].value;
    return (
      <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-lg">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}h
        </p>
        <p className="text-xl font-black text-slate-900 tracking-tighter">
          {value.toFixed(4)}{" "}
          <span className="text-sm font-medium text-slate-400">€/kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function PriceChart({
  data,
  dataKey = "price",
  nameKey = "name",
  currentHour,
}: Props) {
  const prices = data.map((d) => d[dataKey] as number).filter(Boolean);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  return (
    <div
      className="h-[320px] w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
      style={{ display: "block" }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey={nameKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
            interval={2}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
            tickFormatter={(v) => v.toFixed(3)}
          />

          {/* Línea de media del día */}
          <ReferenceLine
            y={avg}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            label={{
              value: "Media",
              fill: "#94a3b8",
              fontSize: 9,
              fontWeight: 700,
            }}
          />

          {/* Línea de hora actual */}
          {currentHour !== undefined && (
            <ReferenceLine
              x={currentHour.toString().padStart(2, "0")}
              stroke="#0f172a"
              strokeWidth={2}
              label={{
                value: "Ahora",
                fill: "#0f172a",
                fontSize: 9,
                fontWeight: 700,
                position: "top",
              }}
            />
          )}

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#f59e0b"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#f59e0b",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
