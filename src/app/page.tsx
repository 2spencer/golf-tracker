import { getPlayers, getRounds } from "@/lib/data";
import { computeSeasonStandings } from "@/lib/stats";
import SeasonStandings from "@/components/leaderboard/SeasonStandings";
import PlayerCard from "@/components/leaderboard/PlayerCard";
import CompareSection from "@/components/compare/CompareSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [players, rounds] = await Promise.all([getPlayers(), getRounds()]);
  const standings = computeSeasonStandings(players, rounds);

  return (
    <div className="space-y-12">
      {/* Leaderboard Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gold">Season Leaderboard</h1>
          <span className="text-sm text-gray-400 bg-forest-light px-3 py-1 rounded-full">
            {rounds.length} rounds played
          </span>
        </div>

        <div className="bg-forest-light border border-forest-lighter rounded-xl overflow-hidden mb-8">
          <SeasonStandings standings={standings} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standings.map((s) => (
            <PlayerCard key={s.player.id} standing={s} />
          ))}
        </div>
      </section>

      {/* Compare Section */}
      <section className="border-t border-forest-lighter pt-12">
        <CompareSection players={players} rounds={rounds} />
      </section>
    </div>
  );
}
