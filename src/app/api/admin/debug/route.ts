import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      redis: false,
      env: {
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      },
    });
  }

  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });

    // Test write
    await redis.set("test_write", { timestamp: new Date().toISOString(), msg: "hello" });
    const testRead = await redis.get("test_write");

    // Read existing data
    const extraRounds = await redis.get("extra_rounds");
    const extraPlayers = await redis.get("extra_players");

    return NextResponse.json({
      redis: true,
      writeTest: testRead,
      extraRounds,
      extraPlayers,
    });
  } catch (err) {
    return NextResponse.json({ redis: true, error: String(err) });
  }
}
