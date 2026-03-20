"use client";

import { useState } from "react";
import type { Player, Round } from "@/lib/types";
import PlayerVsPlayer from "./PlayerVsPlayer";
import TeamVsTeam from "./TeamVsTeam";

export default function CompareSection({
  players,
  rounds,
}: {
  players: Player[];
  rounds: Round[];
}) {
  const [mode, setMode] = useState<"pvp" | "team">("pvp");

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Compare</h2>
        <div className="flex bg-forest-light rounded-lg overflow-hidden border border-forest-lighter">
          <button
            onClick={() => setMode("pvp")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "pvp"
                ? "bg-green text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Player vs Player
          </button>
          <button
            onClick={() => setMode("team")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "team"
                ? "bg-green text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Team vs Team
          </button>
        </div>
      </div>

      {mode === "pvp" ? (
        <PlayerVsPlayer players={players} rounds={rounds} />
      ) : (
        <TeamVsTeam players={players} rounds={rounds} />
      )}
    </div>
  );
}
