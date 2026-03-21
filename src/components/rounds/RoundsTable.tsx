"use client";

import { useState } from "react";
import type { Player, Round } from "@/lib/types";

export default function RoundsTable({
  rounds,
  players,
}: {
  rounds: Round[];
  players: Player[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || "Unknown";

  const getGrossWinner = (round: Round) => {
    const min = Math.min(...round.players.map((p) => p.grossScore));
    const winner = round.players.find((p) => p.grossScore === min);
    return winner ? getPlayerName(winner.playerId) : "";
  };

  const isNineHole = (round: Round) =>
    round.holes === "front9" || round.holes === "back9";

  const getHoleRange = (round: Round): number[] => {
    if (round.holes === "front9") return Array.from({ length: 9 }, (_, i) => i);
    if (round.holes === "back9") return Array.from({ length: 9 }, (_, i) => i + 9);
    return Array.from({ length: 18 }, (_, i) => i);
  };

  return (
    <div className="space-y-3">
      {rounds.map((round) => {
        const isExpanded = expandedId === round.id;
        const nineHole = isNineHole(round);
        const holeRange = getHoleRange(round);
        return (
          <div
            key={round.id}
            className="bg-forest-light border border-forest-lighter rounded-xl overflow-hidden"
          >
            {/* Summary Row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : round.id)}
              className="w-full px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-left hover:bg-forest-lighter/30 transition-colors"
            >
              <span className="text-gray-400 text-sm min-w-[90px]">
                {new Date(round.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-white font-semibold flex-1 min-w-[150px]">
                {round.course}
                {nineHole && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({round.holes === "back9" ? "Back 9" : "Front 9"})
                  </span>
                )}
              </span>
              <span className="text-sm text-gray-300">
                {round.players.length} players
              </span>
              <span className="text-sm">
                <span className="text-gray-400">Winner: </span>
                <span className="text-gold font-bold">
                  {getGrossWinner(round)}
                </span>
              </span>
              {(round.skinsResults || round.skinsAmount) && (
                <span className="text-sm">
                  <span className="text-gray-400">Skins: </span>
                  <span className="text-gold">${round.skinsResults?.pot ?? round.skinsAmount}</span>
                </span>
              )}
              <span className="text-gray-400 text-sm">
                {isExpanded ? "▲" : "▼"}
              </span>
            </button>

            {/* Expanded Scorecard */}
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-forest-lighter">
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-forest-lighter text-gray-400">
                        <th className="px-2 py-2 text-left sticky left-0 bg-forest-light">
                          Player
                        </th>
                        {holeRange.map((i, idx) => (
                          <th
                            key={i}
                            className={`px-2 py-2 text-center min-w-[32px] ${
                              !nineHole && idx === 9
                                ? "border-l-2 border-forest-lighter"
                                : ""
                            }`}
                          >
                            {i + 1}
                          </th>
                        ))}
                        {!nineHole && (
                          <>
                            <th className="px-2 py-2 text-center border-l-2 border-forest-lighter font-bold">
                              F9
                            </th>
                            <th className="px-2 py-2 text-center font-bold">B9</th>
                          </>
                        )}
                        <th className="px-2 py-2 text-center border-l-2 border-forest-lighter font-bold">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {round.players.map((rp) => {
                        const front9 = rp.holesData
                          .slice(0, 9)
                          .reduce<number>((a, b) => a + (b ?? 0), 0);
                        const back9 = rp.holesData
                          .slice(9)
                          .reduce<number>((a, b) => a + (b ?? 0), 0);
                        return (
                          <tr
                            key={rp.playerId}
                            className="border-b border-forest-lighter/50 hover:bg-forest-lighter/20"
                          >
                            <td className="px-2 py-2 font-medium text-white sticky left-0 bg-forest-light">
                              {getPlayerName(rp.playerId)}
                            </td>
                            {holeRange.map((i, idx) => {
                              const score = rp.holesData[i];
                              return (
                                <td
                                  key={i}
                                  className={`px-2 py-2 text-center ${
                                    !nineHole && idx === 9
                                      ? "border-l-2 border-forest-lighter"
                                      : ""
                                  } ${
                                    score === null || score === undefined
                                      ? "text-gray-600"
                                      : score <= 3
                                      ? "text-green-light font-bold"
                                      : score >= 6
                                      ? "text-red-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {score ?? "-"}
                                </td>
                              );
                            })}
                            {!nineHole && (
                              <>
                                <td className="px-2 py-2 text-center border-l-2 border-forest-lighter font-bold text-gray-300">
                                  {front9}
                                </td>
                                <td className="px-2 py-2 text-center font-bold text-gray-300">
                                  {back9}
                                </td>
                              </>
                            )}
                            <td className="px-2 py-2 text-center border-l-2 border-forest-lighter font-bold text-white text-lg">
                              {rp.grossScore}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Skins Results */}
                {(round.skinsResults?.winners?.length ?? 0) > 0 && (
                  <div className="mt-4 p-3 bg-forest/50 rounded-lg">
                    <h4 className="text-sm text-gray-400 uppercase mb-2">
                      Skins (${round.skinsResults!.pot} pot)
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {round.skinsResults!.winners.map((w, i) => (
                        <span
                          key={i}
                          className="text-sm bg-gold/10 text-gold px-3 py-1 rounded-full"
                        >
                          {getPlayerName(w.playerId)}: ${w.amount} (holes{" "}
                          {w.holes.join(", ")})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
