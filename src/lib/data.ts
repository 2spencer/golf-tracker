import fs from "fs/promises";
import path from "path";
import type { Player, Round } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

// Env vars are read inside functions (not module level) so Next.js
// doesn't inline them as undefined at build time.
function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token, enabled: !!(url && token) };
}

async function getRedis() {
  const { url, token } = getRedisConfig();
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: url!, token: token! });
}

export async function getPlayers(): Promise<Player[]> {
  const raw = await fs.readFile(path.join(DATA_DIR, "players.json"), "utf-8");
  const base: Player[] = JSON.parse(raw);

  if (!getRedisConfig().enabled) return base;

  const redis = await getRedis();
  const extra: Player[] = (await redis.get("extra_players")) ?? [];
  const baseIds = new Set(base.map((p) => p.id));
  return [...base, ...extra.filter((p) => !baseIds.has(p.id))];
}

export async function getRounds(): Promise<Round[]> {
  const raw = await fs.readFile(path.join(DATA_DIR, "rounds.json"), "utf-8");
  const base: Round[] = JSON.parse(raw);

  if (!getRedisConfig().enabled) {
    return base.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  const redis = await getRedis();
  const extra: Round[] = (await redis.get("extra_rounds")) ?? [];
  const baseIds = new Set(base.map((r) => r.id));
  const merged = [...base, ...extra.filter((r) => !baseIds.has(r.id))];
  return merged.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getRoundById(id: string): Promise<Round | undefined> {
  const rounds = await getRounds();
  return rounds.find((r) => r.id === id);
}

export async function getPlayerById(id: string): Promise<Player | undefined> {
  const players = await getPlayers();
  return players.find((p) => p.id === id);
}

export async function addPlayer(player: Player): Promise<void> {
  if (!getRedisConfig().enabled) {
    const players = await getPlayers();
    players.push(player);
    await fs.writeFile(
      path.join(DATA_DIR, "players.json"),
      JSON.stringify(players, null, 2)
    );
    return;
  }

  const redis = await getRedis();
  const extra: Player[] = (await redis.get("extra_players")) ?? [];
  extra.push(player);
  await redis.set("extra_players", extra);
}

export async function addRound(round: Round): Promise<void> {
  if (!getRedisConfig().enabled) {
    const raw = await fs.readFile(path.join(DATA_DIR, "rounds.json"), "utf-8");
    const rounds: Round[] = JSON.parse(raw);
    rounds.push(round);
    await fs.writeFile(
      path.join(DATA_DIR, "rounds.json"),
      JSON.stringify(rounds, null, 2)
    );
    return;
  }

  const redis = await getRedis();
  const extra: Round[] = (await redis.get("extra_rounds")) ?? [];
  extra.push(round);
  await redis.set("extra_rounds", extra);
}
