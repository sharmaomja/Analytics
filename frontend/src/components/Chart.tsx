import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { QueryResultRow } from "../types/data";

type ChartProps = {
  data: QueryResultRow[];
  metric: string;
  chartType: "line" | "bar";
};

export function Chart({ data, metric, chartType }: ChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        No results found for this query.
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="dimension" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Bar dataKey={metric} fill="#0f172a" radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="dimension" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Line type="monotone" dataKey={metric} stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
