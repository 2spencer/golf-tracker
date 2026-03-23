"use client";

import { useState } from "react";
import type { Player, ParsedScorecard, Round, RoundPlayer } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

interface PlayerRow {
  name: string;
  matchedPlayerId: string | null;
  isNew: boolean;
  handicap: number;
  scores: (number | null)[];
}

export default function ScorecardForm({
  initialData,
  existingPlayers,
  onSaved,
  onCancel,
  onPlayersUpdated,
}: {
  initialData: ParsedScorecard;
  existingPlayers: Player[];
  onSaved: () => void;
  onCancel: () => void;
  onPlayersUpdated: (players: Player[]) => void;
}) {
  const [course, setCourse] = useState(initialData.course);
  const [date, setDate] = useState(
    initialData.date || new Date().toISOString().split("T")[0]
  );
  const [skinsPot, setSkinsPot] = useState(0);
  const [saving, setSaving] = useState(false);

  const matchPlayer = (name: string): string | null => {
    const match = existingPlayers.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    return match ? match.id : null;
  };

  const [playerRows, setPlayerRows] = useState<PlayerRow[]>(() => {
    if (initialData.players.length === 0) {
      return [
        {
          name: "",
          matchedPlayerId: null,
          isNew: false,
          handicap: 0,
          scores: Array(18).fill(null),
        },
      ];
    }
    return initialData.players.map((p) => {
      const matchedId = matchPlayer(p.name);
      const existingPlayer = existingPlayers.find((ep) => ep.id === matchedId);
      return {
        name: p.name,
        matchedPlayerId: matchedId,
        isNew: !matchedId,
        handicap: existingPlayer?.handicap || 0,
        scores: p.scores.length === 18 ? p.scores : Array(18).fill(null),
      };
    });
  });

  const updatePlayerRow = (index: number, updates: Partial<PlayerRow>) => {
    setPlayerRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const addPlayerRow = () => {
    setPlayerRows((rows) => [
      ...rows,
      {
        name: "",
        matchedPlayerId: null,
        isNew: true,
        handicap: 0,
        scores: Array(18).fill(null),
      },
    ]);
  };

  const removePlayerRow = (index: number) => {
    setPlayerRows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleSelectExisting = (index: number, playerId: string) => {
    const player = existingPlayers.find((p) => p.id === playerId);
    if (player) {
      updatePlayerRow(index, {
        name: player.name,
        matchedPlayerId: player.id,
        isNew: false,
        handicap: player.handicap,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedPlayers = [...existingPlayers];

      // Create new players first
      const playerIdMap: Record<number, string> = {};
      for (let i = 0; i < playerRows.length; i++) {
        const row = playerRows[i];
        if (row.matchedPlayerId) {
          playerIdMap[i] = row.matchedPlayerId;
        } else if (row.name.trim()) {
          const res = await fetch("/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row.name.trim(),
              handicap: row.handicap,
            }),
          });
          const newPlayer: Player = await res.json();
          playerIdMap[i] = newPlayer.id;
          updatedPlayers.push(newPlayer);
        }
      }

      onPlayersUpdated(updatedPlayers);

      // Build round
      const roundPlayers: RoundPlayer[] = playerRows
        .map((row, i) => {
          const playerId = playerIdMap[i];
          if (!playerId) return null;
          const scores = row.scores.map((s) => s ?? 0);
          const grossScore = scores.reduce((a, b) => a + b, 0);
          return {
            playerId,
            grossScore,
            holesData: scores,
          };
        })
        .filter(Boolean) as RoundPlayer[];

      const round: Round = {
        id: uuidv4(),
        date,
        course,
        players: roundPlayers,
        skinsResults: {
          pot: skinsPot,
          winners: [],
        },
      };

      const res = await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(round),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Save failed (${res.status})`);
      }

      onSaved();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Round Info */}
      <div className="bg-forest-light border border-forest-lighter rounded-xl p-5">
        <h3 className="text-white font-bold mb-4">Round Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Course</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full bg-forest border border-forest-lighter rounded-lg px-3 py-2 text-white"
              placeholder="Course name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-forest border border-forest-lighter rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Skins Pot ($)
            </label>
            <input
              type="number"
              value={skinsPot}
              onChange={(e) => setSkinsPot(Number(e.target.value))}
              className="w-full bg-forest border border-forest-lighter rounded-lg px-3 py-2 text-white"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Player Scorecards */}
      {playerRows.map((row, index) => (
        <div
          key={index}
          className="bg-forest-light border border-forest-lighter rounded-xl p-5"
        >
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 block mb-1">
                Player
              </label>
              {row.isNew ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      updatePlayerRow(index, { name: e.target.value })
                    }
                    className="w-full bg-forest border border-forest-lighter rounded-lg px-3 py-2 text-white"
                    placeholder="Player name"
                  />
                  {existingPlayers.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => handleSelectExisting(index, e.target.value)}
                      className="w-full bg-forest border border-forest-lighter rounded-lg px-3 py-2 text-gray-400 text-sm"
                    >
                      <option value="">Or select existing player...</option>
                      {existingPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (HCP {p.handicap})
                        </option>
                      ))}
                    </select>
                  )}
                  {row.isNew && row.name.trim() && (
                    <div className="bg-gold/10 border border-gold/30 rounded-lg p-2 text-xs text-gold">
                      New player — will be added on save
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{row.name}</span>
                  <span className="text-gray-400 text-sm">
                    (HCP {row.handicap})
                  </span>
                </div>
              )}
            </div>
            <div className="w-24">
              <label className="text-sm text-gray-400 block mb-1">
                Handicap
              </label>
              <input
                type="number"
                value={row.handicap}
                onChange={(e) =>
                  updatePlayerRow(index, { handicap: Number(e.target.value) })
                }
                className="w-full bg-forest border border-forest-lighter rounded-lg px-3 py-2 text-white"
                min={0}
              />
            </div>
            <button
              onClick={() => removePlayerRow(index)}
              className="text-red-400 hover:text-red-300 text-sm px-3 py-2"
            >
              Remove
            </button>
          </div>

          {/* Hole-by-hole scores */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  {Array.from({ length: 18 }, (_, i) => (
                    <th
                      key={i}
                      className={`px-1 py-1 text-center min-w-[40px] ${
                        i === 9 ? "border-l-2 border-forest-lighter" : ""
                      }`}
                    >
                      {i + 1}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-center border-l-2 border-forest-lighter font-bold">
                    Tot
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {row.scores.map((score, holeIdx) => (
                    <td
                      key={holeIdx}
                      className={`px-1 py-1 ${
                        holeIdx === 9 ? "border-l-2 border-forest-lighter" : ""
                      }`}
                    >
                      <input
                        type="number"
                        value={score ?? ""}
                        onChange={(e) => {
                          const newScores = [...row.scores];
                          newScores[holeIdx] = e.target.value
                            ? Number(e.target.value)
                            : null;
                          updatePlayerRow(index, { scores: newScores });
                        }}
                        className="w-full bg-forest border border-forest-lighter rounded px-1 py-1 text-center text-white text-sm"
                        min={1}
                        max={15}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center border-l-2 border-forest-lighter font-bold text-gold">
                    {row.scores.reduce<number>(
                      (sum, s) => sum + (s ?? 0),
                      0
                    ) || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={addPlayerRow}
          className="bg-forest-light border border-forest-lighter rounded-lg px-4 py-2 text-gray-300 hover:text-white hover:border-green transition-colors"
        >
          + Add Player
        </button>
        <div className="flex-1" />
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !course.trim() || playerRows.length === 0}
          className="bg-gold text-forest font-bold px-8 py-2 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Round"}
        </button>
      </div>
    </div>
  );
}
