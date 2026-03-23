import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return NextResponse.json({ error: "No Redis configured" }, { status: 500 });
  }
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });
  const rounds = (await redis.get<any[]>("extra_rounds")) ?? [];
  await redis.del("extra_rounds");
  return NextResponse.json({ deleted: rounds.length, rounds });
}
