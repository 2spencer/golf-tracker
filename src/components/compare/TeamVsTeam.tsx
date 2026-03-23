"use client";

import { useState, useMemo } from "react";
import type { Player, Round } from "@/lib/types";

interface HoleResult {
  hole: number; // 1-indexed display number
  team1Combined: number | null;
  team2Combined: number | null;
  // 1 = team1 wins, 2 = team2 wins, 0 = halved, null = no data
  winner: 1 | 2 | 0 | null;
}

interface RoundResult {
  date: string;
  course: string;
  team1Score: number;
  team2Score: number;
  // Match play
  team1Points: number;
  team2Points: number;
  halvedHoles: number;
  holeResults: HoleResult[];
}

export default function TeamVsTeam({
  players,
  rounds,
}: {
  players: Player[];
  rounds: Round[];
}) {
  const [team1Ids, setTeam1Ids] = useState<string[]>([]);
  const [team2Ids, setTeam2Ids] = useState<string[]>([]);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  const toggleTeam = (
    playerId: string,
    team: 1 | 2,
    setter: (ids: string[]) => void,
    current: string[]
  ) => {
    if (current.includes(playerId)) {
      setter(current.filter((id) => id !== playerId));
    } else {
      if (team === 1) setTeam2Ids(team2Ids.filter((id) => id !== playerId));
      else setTeam1Ids(team1Ids.filter((id) => id !== playerId));
      setter([...current, playerId]);
    }
  };

  const results = useMemo(() => {
    if (team1Ids.length === 0 || team2Ids.length === 0) return null;

    const sharedRounds = rounds.filter((r) => {
      const playerIds = r.players.map((p) => p.playerId);
      return (
        team1Ids.every((id) => playerIds.includes(id)) &&
        team2Ids.every((id) => playerIds.includes(id))
      );
    });

    if (sharedRounds.length === 0) return null;

    let team1RoundWins = 0, team2RoundWins = 0, roundTies = 0;
    let bestTeam1 = Infinity, bestTeam2 = Infinity;
    let totalTeam1Points = 0, totalTeam2Points = 0;

    const roundResults: RoundResult[] = sharedRounds.map((r) => {
      const isBack9 = r.holes === "back9";
      const isFront9 = r.holes === "front9";
      const isNine = isBack9 || isFront9;

      // Determine which hole indices to use
      const holeIndices = isBack9
        ? Array.from({ length: 9 }, (_, i) => i + 9)
        : isFront9
        ? Array.from({ length: 9 }, (_, i) => i)
        : Array.from({ length: 18 }, (_, i) => i);

      const t1Score = team1Ids.reduce((sum, id) => {
        const rp = r.players.find((p) => p.playerId === id)!;
        return sum + rp.grossScore;
      }, 0);
      const t2Score = team2Ids.reduce((sum, id) => {
        const rp = r.players.find((p) => p.playerId === id)!;
        return sum + rp.grossScore;
      }, 0);

      if (t1Score < t2Score) team1RoundWins++;
      else if (t2Score < t1Score) team2RoundWins++;
      else roundTies++;

      bestTeam1 = Math.min(bestTeam1, t1Score);
      bestTeam2 = Math.min(bestTeam2, t2Score);

      // Hole-by-hole match play
      let team1Points = 0, team2Points = 0, halvedHoles = 0;
      const holeResults: HoleResult[] = holeIndices.map((holeIdx) => {
        const t1Hole = team1Ids.reduce<number | null>((sum, id) => {
          const rp = r.players.find((p) => p.playerId === id)!;
          const score = rp.holesData[holeIdx];
          if (score == null) return null;
          return (sum ?? 0) + score;
        }, 0);
        const t2Hole = team2Ids.reduce<number | null>((sum, id) => {
          const rp = r.players.find((p) => p.playerId === id)!;
          const score = rp.holesData[holeIdx];
          if (score == null) return null;
          return (sum ?? 0) + score;
        }, 0);

        let winner: 1 | 2 | 0 | null = null;
        if (t1Hole != null && t2Hole != null) {
          if (t1Hole < t2Hole) { winner = 1; team1Points++; }
          else if (t2Hole < t1Hole) { winner = 2; team2Points++; }
          else { winner = 0; halvedHoles++; }
        }

        return {
          hole: isBack9 ? holeIdx - 8 : holeIdx + 1, // display as 1-9
          team1Combined: t1Hole,
          team2Combined: t2Hole,
          winner,
        };
      });

      totalTeam1Points += team1Points;
      totalTeam2Points += team2Points;

      return {
        date: r.date,
        course: r.course,
        team1Score: t1Score,
        team2Score: t2Score,
        team1Points,
        team2Points,
        halvedHoles,
        holeResults,
      };
    });

    return {
      roundResults,
      team1RoundWins,
      team2RoundWins,
      roundTies,
      bestTeam1,
      bestTeam2,
      totalTeam1Points,
      totalTeam2Points,
    };
  }, [team1Ids, team2Ids, rounds]);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  const team1Label = team1Ids.length > 0
    ? team1Ids.map(getPlayerName).join(" & ")
    : "Team 1";
  const team2Label = team2Ids.length > 0
    ? team2Ids.map(getPlayerName).join(" & ")
    : "Team 2";

  return (
    <div className="space-y-6">
      {/* Team selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
          <h4 className="text-gold font-bold mb-3">Team 1</h4>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleTeam(p.id, 1, setTeam1Ids, team1Ids)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  team1Ids.includes(p.id)
                    ? "bg-gold text-forest"
                    : team2Ids.includes(p.id)
                    ? "bg-forest-lighter text-gray-500 cursor-not-allowed"
                    : "bg-forest-lighter text-gray-300 hover:bg-forest-lighter/80"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
          <h4 className="text-green-light font-bold mb-3">Team 2</h4>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleTeam(p.id, 2, setTeam2Ids, team2Ids)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  team2Ids.includes(p.id)
                    ? "bg-green text-white"
                    : team1Ids.includes(p.id)
                    ? "bg-forest-lighter text-gray-500 cursor-not-allowed"
                    : "bg-forest-lighter text-gray-300 hover:bg-forest-lighter/80"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {results && (
        <>
          {/* Overall match play points */}
          <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
            <h4 className="text-sm text-gray-400 uppercase mb-4">Total Match Play Points</h4>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold">{results.totalTeam1Points}</div>
                <div className="text-sm text-gray-400 mt-1">{team1Label}</div>
              </div>
              <div className="text-center text-gray-500 text-sm">
                <div>pts across</div>
                <div>{results.roundResults.length} round{results.roundResults.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-light">{results.totalTeam2Points}</div>
                <div className="text-sm text-gray-400 mt-1">{team2Label}</div>
              </div>
            </div>
          </div>

          {/* Best combined round */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-forest-light border border-forest-lighter rounded-xl p-5 text-center">
              <div className="text-xs text-gray-400 uppercase mb-2">Best Combined ({team1Label})</div>
              <div className="text-3xl font-bold text-gold">{results.bestTeam1}</div>
            </div>
            <div className="bg-forest-light border border-forest-lighter rounded-xl p-5 text-center">
              <div className="text-xs text-gray-400 uppercase mb-2">Best Combined ({team2Label})</div>
              <div className="text-3xl font-bold text-green-light">{results.bestTeam2}</div>
            </div>
          </div>

          {/* Round-by-round with expandable hole-by-hole */}
          <div className="space-y-3">
            <h4 className="text-sm text-gray-400 uppercase">Round Results</h4>
            {results.roundResults.map((r, i) => (
              <div key={i} className="bg-forest-light border border-forest-lighter rounded-xl overflow-hidden">
                {/* Round summary row */}
                <button
                  onClick={() => setExpandedRound(expandedRound === i ? null : i)}
                  className="w-full px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-left hover:bg-forest-lighter/30 transition-colors"
                >
                  <span className="text-gray-400 text-sm min-w-[80px]">
                    {new Date(r.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-white font-semibold flex-1">{r.course}</span>

                  {/* Match play score */}
                  <span className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${r.team1Points > r.team2Points ? "text-gold" : "text-gray-400"}`}>
                      {r.team1Points}
                    </span>
                    <span className="text-gray-500 text-sm">pts</span>
                    <span className="text-gray-500">—</span>
                    <span className={`text-xl font-bold ${r.team2Points > r.team1Points ? "text-green-light" : "text-gray-400"}`}>
                      {r.team2Points}
                    </span>
                    <span className="text-gray-500 text-sm">pts</span>
                    {r.halvedHoles > 0 && (
                      <span className="text-gray-500 text-xs">({r.halvedHoles} halved)</span>
                    )}
                  </span>

                  {/* Combined scores */}
                  <span className="text-sm text-gray-400">
                    Stroke: {r.team1Score} – {r.team2Score}
                  </span>

                  <span className="text-gray-400 text-sm">{expandedRound === i ? "▲" : "▼"}</span>
                </button>

                {/* Hole-by-hole breakdown */}
                {expandedRound === i && (
                  <div className="px-5 pb-5 border-t border-forest-lighter">
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-forest-lighter text-gray-400">
                            <th className="px-2 py-2 text-left">Team</th>
                            {r.holeResults.map((h) => (
                              <th key={h.hole} className="px-2 py-2 text-center min-w-[36px]">
                                {h.hole}
                              </th>
                            ))}
                            <th className="px-2 py-2 text-center border-l-2 border-forest-lighter font-bold">Pts</th>
                            <th className="px-2 py-2 text-center font-bold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Team 1 row */}
                          <tr className="border-b border-forest-lighter/50">
                            <td className="px-2 py-2 font-medium text-gold">{team1Label}</td>
                            {r.holeResults.map((h) => (
                              <td
                                key={h.hole}
                                className={`px-2 py-2 text-center font-bold ${
                                  h.winner === 1
                                    ? "text-gold bg-gold/10"
                                    : h.winner === 0
                                    ? "text-gray-400"
                                    : h.winner === 2
                                    ? "text-gray-500"
                                    : "text-gray-600"
                                }`}
                              >
                                {h.team1Combined ?? "-"}
                                {h.winner === 1 && <span className="ml-0.5 text-xs">✓</span>}
                              </td>
                            ))}
                            <td className="px-2 py-2 text-center border-l-2 border-forest-lighter font-bold text-gold text-lg">
                              {r.team1Points}
                            </td>
                            <td className="px-2 py-2 text-center font-bold text-white">
                              {r.team1Score}
                            </td>
                          </tr>
                          {/* Team 2 row */}
                          <tr className="border-b border-forest-lighter/50">
                            <td className="px-2 py-2 font-medium text-green-light">{team2Label}</td>
                            {r.holeResults.map((h) => (
                              <td
                                key={h.hole}
                                className={`px-2 py-2 text-center font-bold ${
                                  h.winner === 2
                                    ? "text-green-light bg-green/10"
                                    : h.winner === 0
                                    ? "text-gray-400"
                                    : h.winner === 1
                                    ? "text-gray-500"
                                    : "text-gray-600"
                                }`}
                              >
                                {h.team2Combined ?? "-"}
                                {h.winner === 2 && <span className="ml-0.5 text-xs">✓</span>}
                              </td>
                            ))}
                            <td className="px-2 py-2 text-center border-l-2 border-forest-lighter font-bold text-green-light text-lg">
                              {r.team2Points}
                            </td>
                            <td className="px-2 py-2 text-center font-bold text-white">
                              {r.team2Score}
                            </td>
                          </tr>
                          {/* Winner row */}
                          <tr>
                            <td className="px-2 py-2 text-gray-500 text-xs">Winner</td>
                            {r.holeResults.map((h) => (
                              <td key={h.hole} className="px-2 py-1 text-center text-xs text-gray-500">
                                {h.winner === 1 ? <span className="text-gold">T1</span>
                                  : h.winner === 2 ? <span className="text-green-light">T2</span>
                                  : h.winner === 0 ? "½"
                                  : "-"}
                              </td>
                            ))}
                            <td colSpan={2} />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!results && team1Ids.length > 0 && team2Ids.length > 0 && (
        <p className="text-gray-400">No shared rounds found for these team selections.</p>
      )}
      {(team1Ids.length === 0 || team2Ids.length === 0) && (
        <p className="text-gray-400">Select players for both teams to see comparisons.</p>
      )}
    </div>
  );
}
