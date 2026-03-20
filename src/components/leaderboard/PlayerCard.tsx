import Link from "next/link";
import type { SeasonStanding } from "@/lib/types";

export default function PlayerCard({ standing }: { standing: SeasonStanding }) {
  return (
    <Link href={`/players/${standing.player.id}`}>
      <div className="bg-forest-light border border-forest-lighter rounded-xl p-5 hover:border-green transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-white text-lg">
            {standing.player.name}
          </h3>
          <span className="bg-green/20 text-green-light text-xs font-medium px-2 py-1 rounded">
            HCP {standing.player.handicap}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-gray-400 uppercase">Rounds</div>
            <div className="text-xl font-bold text-gold">
              {standing.roundsPlayed}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Avg (9)</div>
            <div className="text-xl font-bold text-white">
              {standing.grossAvg9.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Best 9</div>
            <div className="text-xl font-bold text-green-light">
              {standing.best9}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
