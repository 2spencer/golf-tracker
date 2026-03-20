import { getPlayers, getRounds } from "@/lib/data";
import RoundsTable from "@/components/rounds/RoundsTable";

export const dynamic = "force-dynamic";

export default async function RoundsPage() {
  const [players, rounds] = await Promise.all([getPlayers(), getRounds()]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gold mb-6">Round History</h1>
      <RoundsTable rounds={rounds} players={players} />
    </div>
  );
}
