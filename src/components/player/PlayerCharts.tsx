"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RoundScore {
  date: string;
  course: string;
  gross: number;
  net: number;
  front9: number;
  back9: number;
}

export default function PlayerCharts({
  roundScores,
}: {
  roundScores: RoundScore[];
}) {
  const chartData = roundScores.map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    gross: r.gross,
    net: r.net,
    front9: r.front9,
    back9: r.back9,
    course: r.course,
  }));

  if (chartData.length === 0) {
    return <p className="text-gray-400">No round data to display.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scoring Trend */}
      <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
        <h3 className="text-sm text-gray-400 uppercase mb-4">Scoring Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243824" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a2e1a",
                border: "1px solid #243824",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="gross"
              stroke="#ffffff"
              strokeWidth={2}
              dot={{ fill: "#ffffff", r: 4 }}
              name="Gross"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#c9a84c"
              strokeWidth={2}
              dot={{ fill: "#c9a84c", r: 4 }}
              name="Net"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Front 9 vs Back 9 */}
      <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
        <h3 className="text-sm text-gray-400 uppercase mb-4">
          Front 9 vs Back 9
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243824" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a2e1a",
                border: "1px solid #243824",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="front9"
              stroke="#2d5a27"
              strokeWidth={2}
              dot={{ fill: "#2d5a27", r: 4 }}
              name="Front 9"
            />
            <Line
              type="monotone"
              dataKey="back9"
              stroke="#3d7a35"
              strokeWidth={2}
              dot={{ fill: "#3d7a35", r: 4 }}
              name="Back 9"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
