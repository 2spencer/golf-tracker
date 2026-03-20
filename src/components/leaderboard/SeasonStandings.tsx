"use client";

import { useState } from "react";
import Link from "next/link";
import type { SeasonStanding } from "@/lib/types";

type SortKey = "grossAvg9" | "wins" | "moneyWon";

export default function SeasonStandings({
  standings,
}: {
  standings: SeasonStanding[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("grossAvg9");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...standings].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (sortKey === "moneyWon" || sortKey === "wins") {
      return sortAsc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(key === "grossAvg9");
    }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-4 py-3 text-left cursor-pointer hover:text-gold transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === field && (
          <span className="text-gold">{sortAsc ? "▲" : "▼"}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-forest-lighter text-sm text-gray-400 uppercase tracking-wider">
            <th className="px-4 py-3 text-left w-8">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-left">Rds</th>
            <SortHeader label="Avg (9)" field="grossAvg9" />
            <th className="px-4 py-3 text-left">Best 9</th>
            <th className="px-4 py-3 text-left">Worst 9</th>
            <SortHeader label="Wins" field="wins" />
            <SortHeader label="Money" field="moneyWon" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => (
            <tr
              key={s.player.id}
              className="border-b border-forest-lighter/50 hover:bg-forest-light transition-colors"
            >
              <td className="px-4 py-4 text-gold font-bold text-lg">{i + 1}</td>
              <td className="px-4 py-4">
                <Link
                  href={`/players/${s.player.id}`}
                  className="hover:text-gold transition-colors"
                >
                  <div className="font-semibold text-white">{s.player.name}</div>
                  <div className="text-xs text-gray-400">
                    HCP {s.player.handicap}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-4 text-gray-300">{s.roundsPlayed}</td>
              <td className="px-4 py-4 font-bold text-2xl text-white">
                {s.grossAvg9.toFixed(1)}
              </td>
              <td className="px-4 py-4 font-bold text-lg text-green-light">
                {s.best9}
              </td>
              <td className="px-4 py-4 font-bold text-lg text-red-400">
                {s.worst9}
              </td>
              <td className="px-4 py-4 font-bold text-lg text-gold">
                {s.wins}
              </td>
              <td className="px-4 py-4 font-bold text-lg text-gold">
                ${s.moneyWon}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
