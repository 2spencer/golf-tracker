"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { Player, Round } from "@/lib/types";
import { getCompareData } from "@/lib/stats";

export default function PlayerVsPlayer({
  players,
  rounds,
}: {
  players: Player[];
  rounds: Round[];
}) {
  const [p1Id, setP1Id] = useState(players[0]?.id || "");
  const [p2Id, setP2Id] = useState(players[1]?.id || "");

  const p1 = players.find((p) => p.id === p1Id);
  const p2 = players.find((p) => p.id === p2Id);

  const data = useMemo(() => {
    if (!p1Id || !p2Id || p1Id === p2Id) return [];
    return getCompareData(p1Id, p2Id, rounds);
  }, [p1Id, p2Id, rounds]);

  const h2h = useMemo(() => {
    let grossP1 = 0, grossP2 = 0, grossTie = 0;
    let netP1 = 0, netP2 = 0, netTie = 0;
    for (const d of data) {
      if (d.p1Gross < d.p2Gross) grossP1++;
      else if (d.p1Gross > d.p2Gross) grossP2++;
      else grossTie++;
      if (d.p1Net < d.p2Net) netP1++;
      else if (d.p1Net > d.p2Net) netP2++;
      else netTie++;
    }
    return { grossP1, grossP2, grossTie, netP1, netP2, netTie };
  }, [data]);

  const front9Back9 = useMemo(() => {
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      [`${p1?.name} F9`]: d.p1Front,
      [`${p1?.name} B9`]: d.p1Back,
      [`${p2?.name} F9`]: d.p2Front,
      [`${p2?.name} B9`]: d.p2Back,
    }));
  }, [data, p1, p2]);

  if (players.length < 2) {
    return <p className="text-gray-400">Need at least 2 players to compare.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select
          value={p1Id}
          onChange={(e) => setP1Id(e.target.value)}
          className="bg-forest-light border border-forest-lighter rounded-lg px-4 py-2 text-white"
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="text-gold font-bold self-center text-xl">VS</span>
        <select
          value={p2Id}
          onChange={(e) => setP2Id(e.target.value)}
          className="bg-forest-light border border-forest-lighter rounded-lg px-4 py-2 text-white"
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {p1Id !== p2Id && data.length > 0 && (
        <>
          {/* H2H Record */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
              <h4 className="text-sm text-gray-400 uppercase mb-3">
                Gross Record
              </h4>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">
                    {h2h.grossP1}
                  </div>
                  <div className="text-sm text-gray-400">{p1?.name}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl text-gray-500">{h2h.grossTie} ties</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">
                    {h2h.grossP2}
                  </div>
                  <div className="text-sm text-gray-400">{p2?.name}</div>
                </div>
              </div>
            </div>
            <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
              <h4 className="text-sm text-gray-400 uppercase mb-3">
                Net Record
              </h4>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-light">
                    {h2h.netP1}
                  </div>
                  <div className="text-sm text-gray-400">{p1?.name}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl text-gray-500">{h2h.netTie} ties</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-light">
                    {h2h.netP2}
                  </div>
                  <div className="text-sm text-gray-400">{p2?.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Differential Trend */}
          <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
            <h4 className="text-sm text-gray-400 uppercase mb-4">
              Score Differential Trend (Gross)
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={data.map((d) => ({
                  date: new Date(d.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  diff: d.grossDiff,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#243824" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a2e1a",
                    border: "1px solid #243824",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => {
                    const v = Number(value);
                    return v > 0
                      ? `+${v} (${p1?.name} higher)`
                      : v < 0
                      ? `${v} (${p2?.name} higher)`
                      : "Even";
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="diff"
                  stroke="#c9a84c"
                  strokeWidth={3}
                  dot={{ fill: "#c9a84c", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Front 9 vs Back 9 */}
          <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
            <h4 className="text-sm text-gray-400 uppercase mb-4">
              Front 9 vs Back 9
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={front9Back9}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243824" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a2e1a",
                    border: "1px solid #243824",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar
                  dataKey={`${p1?.name} F9`}
                  fill="#c9a84c"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={`${p1?.name} B9`}
                  fill="#c9a84c80"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={`${p2?.name} F9`}
                  fill="#2d5a27"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={`${p2?.name} B9`}
                  fill="#2d5a2780"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {p1Id === p2Id && (
        <p className="text-gray-400">Select two different players to compare.</p>
      )}
    </div>
  );
}
