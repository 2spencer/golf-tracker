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

    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const hasRedis = !!(redisUrl && redisToken);

    if (hasRedis) {
      // Write directly to Redis to bypass any data.ts issues
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: redisUrl!, token: redisToken! });
      const extra: Round[] = (await redis.get("extra_rounds")) ?? [];
      extra.push(round);
      await redis.set("extra_rounds", extra);
      return NextResponse.json({ saved: true, hasRedis: true, via: "direct-redis", round }, { status: 201 });
    }

    await addRound(round);
    return NextResponse.json({ saved: true, hasRedis: false, via: "filesystem", round }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { saved: false, error: String(err), stack: (err as Error).stack },
      { status: 500 }
    );
  }
}
