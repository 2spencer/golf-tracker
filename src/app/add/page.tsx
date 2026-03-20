"use client";

import { useState, useEffect } from "react";
import type { Player, ParsedScorecard } from "@/lib/types";
import ImageUpload from "@/components/add/ImageUpload";
import ScorecardForm from "@/components/add/ScorecardForm";

export default function AddRoundPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [parsed, setParsed] = useState<ParsedScorecard | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then(setPlayers);
  }, []);

  const handleSaved = () => {
    setSaved(true);
    setParsed(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gold">Add Round</h1>

      {saved && (
        <div className="bg-green/20 border border-green rounded-xl p-4 text-green-light">
          Round saved successfully!{" "}
          <button
            onClick={() => setSaved(false)}
            className="underline hover:text-gold"
          >
            Add another
          </button>
        </div>
      )}

      {!parsed && !saved && (
        <div className="space-y-6">
          <ImageUpload onParsed={setParsed} />
          <div className="text-center text-gray-400">— or —</div>
          <button
            onClick={() =>
              setParsed({
                course: "",
                date: new Date().toISOString().split("T")[0],
                players: [],
              })
            }
            className="w-full bg-forest-light border border-forest-lighter rounded-xl p-6 text-center hover:border-green transition-colors cursor-pointer"
          >
            <span className="text-white font-semibold">Enter Manually</span>
            <p className="text-sm text-gray-400 mt-1">
              Skip image upload and enter scores by hand
            </p>
          </button>
        </div>
      )}

      {parsed && !saved && (
        <ScorecardForm
          initialData={parsed}
          existingPlayers={players}
          onSaved={handleSaved}
          onCancel={() => setParsed(null)}
          onPlayersUpdated={setPlayers}
        />
      )}
    </div>
  );
}
