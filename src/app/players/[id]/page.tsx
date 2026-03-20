import { getPlayers, getRounds } from "@/lib/data";
import { computeH2H, getPlayerRoundScores } from "@/lib/stats";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlayerCharts from "@/components/player/PlayerCharts";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [players, rounds] = await Promise.all([getPlayers(), getRounds()]);
  const player = players.find((p) => p.id === id);

  if (!player) notFound();

  const h2h = computeH2H(id, players, rounds);
  const roundScores = getPlayerRoundScores(id, rounds);

  const playerRounds = rounds.filter((r) =>
    r.players.some((p) => p.playerId === id)
  );

  const grossScores = playerRounds.map(
    (r) => r.players.find((p) => p.playerId === id)!.grossScore
  );

  const grossAvg =
    grossScores.length > 0
      ? (grossScores.reduce((a, b) => a + b, 0) / grossScores.length).toFixed(1)
      : "N/A";
  const bestGross = grossScores.length > 0 ? Math.min(...grossScores) : "N/A";
  const worstGross = grossScores.length > 0 ? Math.max(...grossScores) : "N/A";

  // Favorite course
  const courseCount: Record<string, number> = {};
  for (const r of playerRounds) {
    courseCount[r.course] = (courseCount[r.course] || 0) + 1;
  }
  const favoriteCourse =
    Object.entries(courseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Money won
  const moneyWon = playerRounds.reduce((total, r) => {
    const w = r.skinsResults.winners.find((w) => w.playerId === id);
    return total + (w ? w.amount : 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gold transition-colors mb-2 inline-block"
          >
            &larr; Back to Leaderboard
          </Link>
          <h1 className="text-3xl font-bold text-white">{player.name}</h1>
          <div className="flex gap-4 mt-2">
            <span className="bg-green/20 text-green-light text-sm font-medium px-3 py-1 rounded-full">
              Handicap: {player.handicap}
            </span>
            <span className="text-gray-400 text-sm self-center">
              {playerRounds.length} rounds
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Scoring Avg", value: grossAvg, color: "text-white" },
          { label: "Best Round", value: bestGross, color: "text-green-light" },
          { label: "Worst Round", value: worstGross, color: "text-red-400" },
          { label: "Money Won", value: `$${moneyWon}`, color: "text-gold" },
          { label: "Fav Course", value: favoriteCourse, color: "text-white", small: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-forest-light border border-forest-lighter rounded-xl p-4"
          >
            <div className="text-xs text-gray-400 uppercase">{stat.label}</div>
            <div
              className={`${stat.color} font-bold ${
                stat.small ? "text-sm mt-1" : "text-2xl"
              }`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <PlayerCharts roundScores={roundScores} />

      {/* H2H Records */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Head-to-Head Records
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {h2h.map((record) => (
            <div
              key={record.opponent.id}
              className="bg-forest-light border border-forest-lighter rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <Link
                  href={`/players/${record.opponent.id}`}
                  className="font-bold text-white hover:text-gold transition-colors"
                >
                  vs {record.opponent.name}
                </Link>
                <span className="text-xs text-gray-400">
                  HCP {record.opponent.handicap}
                </span>
              </div>
              <div>
                <div className="text-lg font-bold">
                  <span className="text-green-light">{record.wins}W</span>
                  <span className="text-gray-500"> - </span>
                  <span className="text-red-400">{record.losses}L</span>
                  {record.ties > 0 && (
                    <span className="text-gray-400"> - {record.ties}T</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
