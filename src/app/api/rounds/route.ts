import { NextResponse } from "next/server";
import { getRounds, addRound } from "@/lib/data";
import type { Round } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const rounds = await getRounds();
  return NextResponse.json(rounds);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const round: Round = {
      ...body,
      id: body.id || uuidv4(),
    };
    await addRound(round);
    return NextResponse.json({ saved: true, round }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { saved: false, error: String(err), stack: (err as Error).stack },
      { status: 500 }
    );
  }
}
