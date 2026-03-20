"use client";

import { useState, useMemo } from "react";
import type { Player, Round } from "@/lib/types";

export default function TeamVsTeam({
  players,
  rounds,
}: {
  players: Player[];
  rounds: Round[];
}) {
  const [team1Ids, setTeam1Ids] = useState<string[]>([]);
  const [team2Ids, setTeam2Ids] = useState<string[]>([]);

  const toggleTeam = (
    playerId: string,
    team: 1 | 2,
    setter: (ids: string[]) => void,
    current: string[]
  ) => {
    if (current.includes(playerId)) {
      setter(current.filter((id) => id !== playerId));
    } else {
      // Remove from other team if present
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

    let team1Wins = 0,
      team2Wins = 0,
      ties = 0;
    let bestTeam1 = Infinity,
      bestTeam2 = Infinity;

    const roundResults = sharedRounds.map((r) => {
      const t1Score = team1Ids.reduce((sum, id) => {
        const rp = r.players.find((p) => p.playerId === id)!;
        return sum + rp.grossScore;
      }, 0);
      const t2Score = team2Ids.reduce((sum, id) => {
        const rp = r.players.find((p) => p.playerId === id)!;
        return sum + rp.grossScore;
      }, 0);

      if (t1Score < t2Score) team1Wins++;
      else if (t2Score < t1Score) team2Wins++;
      else ties++;

      bestTeam1 = Math.min(bestTeam1, t1Score);
      bestTeam2 = Math.min(bestTeam2, t2Score);

      return {
        date: r.date,
        course: r.course,
        team1Score: t1Score,
        team2Score: t2Score,
      };
    });

    return { roundResults, team1Wins, team2Wins, ties, bestTeam1, bestTeam2 };
  }, [team1Ids, team2Ids, rounds]);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 */}
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

        {/* Team 2 */}
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
          {/* W/L Record */}
          <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
            <h4 className="text-sm text-gray-400 uppercase mb-3">
              Team Record (Combined Score)
            </h4>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">
                  {results.team1Wins}
                </div>
                <div className="text-sm text-gray-400">Team 1 Wins</div>
              </div>
              <div className="text-center">
                <div className="text-xl text-gray-500">{results.ties} ties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-light">
                  {results.team2Wins}
                </div>
                <div className="text-sm text-gray-400">Team 2 Wins</div>
              </div>
            </div>
          </div>

          {/* Best Combined Round */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-forest-light border border-forest-lighter rounded-xl p-5 text-center">
              <div className="text-sm text-gray-400 uppercase mb-2">
                Best Combined (Team 1)
              </div>
              <div className="text-3xl font-bold text-gold">
                {results.bestTeam1}
              </div>
            </div>
            <div className="bg-forest-light border border-forest-lighter rounded-xl p-5 text-center">
              <div className="text-sm text-gray-400 uppercase mb-2">
                Best Combined (Team 2)
              </div>
              <div className="text-3xl font-bold text-green-light">
                {results.bestTeam2}
              </div>
            </div>
          </div>

          {/* Round-by-round */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest-lighter text-sm text-gray-400 uppercase">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-right">Team 1</th>
                  <th className="px-4 py-3 text-right">Team 2</th>
                  <th className="px-4 py-3 text-center">Winner</th>
                </tr>
              </thead>
              <tbody>
                {results.roundResults.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-forest-lighter/50 hover:bg-forest-lighter/30"
                  >
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white">{r.course}</td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        r.team1Score <= r.team2Score ? "text-gold" : "text-gray-400"
                      }`}
                    >
                      {r.team1Score}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        r.team2Score <= r.team1Score
                          ? "text-green-light"
                          : "text-gray-400"
                      }`}
                    >
                      {r.team2Score}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.team1Score < r.team2Score
                        ? "Team 1"
                        : r.team2Score < r.team1Score
                        ? "Team 2"
                        : "Tie"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!results && team1Ids.length > 0 && team2Ids.length > 0 && (
        <p className="text-gray-400">
          No shared rounds found for these team selections.
        </p>
      )}

      {(team1Ids.length === 0 || team2Ids.length === 0) && (
        <p className="text-gray-400">
          Select players for both teams to see comparisons.
        </p>
      )}
    </div>
  );
}
