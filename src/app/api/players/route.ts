import { NextResponse } from "next/server";
import { getPlayers, addPlayer } from "@/lib/data";
import type { Player } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const players = await getPlayers();
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const body = await request.json();
  const player: Player = {
    id: uuidv4(),
    name: body.name,
    handicap: body.handicap,
  };
  await addPlayer(player);
  return NextResponse.json(player, { status: 201 });
}
