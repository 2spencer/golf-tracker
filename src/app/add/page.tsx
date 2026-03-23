"use client";

import { useState, useEffect } from "react";
import type { Player, ParsedScorecard } from "@/lib/types";
import ImageUpload from "@/components/add/ImageUpload";
import ScorecardForm from "@/components/add/ScorecardForm";

export default function AddRoundPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [parsed, setParsed] = useState<ParsedScorecard | null>(null);
  const [saved, setSaved] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then(setPlayers);
  }, []);

  const handlePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim().length === 0) return;
    setPasscode(passcodeInput.trim());
    setPasscodeError(false);
  };

  const handleSaved = () => {
    setSaved(true);
    setParsed(null);
  };

  const handlePasscodeRejected = () => {
    setPasscode("");
    setPasscodeInput("");
    setPasscodeError(true);
  };

  if (!passcode) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gold">Add Round</h1>
        <div className="max-w-sm mx-auto bg-forest-light border border-forest-lighter rounded-xl p-8 space-y-4">
          <p className="text-white font-semibold text-center">Enter Passcode</p>
          <p className="text-sm text-gray-400 text-center">
            Required to add or upload rounds.
          </p>
          <form onSubmit={handlePasscode} className="space-y-3">
            <input
              type="password"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="Passcode"
              className="w-full bg-forest border border-forest-lighter rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            />
            {passcodeError && (
              <p className="text-red-400 text-sm text-center">Wrong passcode. Try again.</p>
            )}
            <button
              type="submit"
              className="w-full bg-gold text-forest font-bold py-2 rounded-lg hover:bg-gold/90 transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <ImageUpload
            onParsed={setParsed}
            passcode={passcode}
            onPasscodeRejected={handlePasscodeRejected}
          />
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
