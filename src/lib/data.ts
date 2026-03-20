import fs from "fs/promises";
import path from "path";
import type { Player, Round } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

export async function getPlayers(): Promise<Player[]> {
  const raw = await fs.readFile(path.join(DATA_DIR, "players.json"), "utf-8");
  return JSON.parse(raw);
}

export async function getRounds(): Promise<Round[]> {
  const raw = await fs.readFile(path.join(DATA_DIR, "rounds.json"), "utf-8");
  const rounds: Round[] = JSON.parse(raw);
  return rounds.sort(
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
  const players = await getPlayers();
  players.push(player);
  await fs.writeFile(
    path.join(DATA_DIR, "players.json"),
    JSON.stringify(players, null, 2)
  );
}

export async function addRound(round: Round): Promise<void> {
  const raw = await fs.readFile(path.join(DATA_DIR, "rounds.json"), "utf-8");
  const rounds: Round[] = JSON.parse(raw);
  rounds.push(round);
  await fs.writeFile(
    path.join(DATA_DIR, "rounds.json"),
    JSON.stringify(rounds, null, 2)
  );
}
