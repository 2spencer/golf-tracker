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
  front9: number;
  back9: number;
}

export default function PlayerCharts({
  roundScores,
}: {
  roundScores: RoundScore[];
}) {
  const chartData = roundScores.map((r) => ({
    date: new Date(r.date + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    gross: r.gross,
    front9: r.front9,
    back9: r.back9,
    course: r.course,
  }));

  if (chartData.length === 0) {
    return <p className="text-gray-400">No round data to display.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
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
              stroke="#c9a84c"
              strokeWidth={2}
              dot={{ fill: "#c9a84c", r: 4 }}
              name="Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
