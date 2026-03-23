import { NextResponse } from "next/server";
import type { Round } from "@/lib/types";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ error: "No Redis configured" }, { status: 500 });
  }

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url: redisUrl, token: redisToken });

  const extra: Round[] = (await redis.get("extra_rounds")) ?? [];
  const filtered = extra.filter((r) => r.id !== id);

  if (filtered.length === extra.length) {
    return NextResponse.json({ error: "Round not found in Redis" }, { status: 404 });
  }

  await redis.set("extra_rounds", filtered);
  return NextResponse.json({ deleted: true, id });
}
