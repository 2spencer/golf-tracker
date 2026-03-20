import type { Player, Round, SeasonStanding, H2HRecord } from "./types";

function sumHoles(holes: (number | null)[]): number {
  return holes.reduce<number>((a, b) => a + (b ?? 0), 0);
}

function isNineHoleRound(round: Round): boolean {
  return round.holes === "front9" || round.holes === "back9";
}

/**
 * Get all 9-hole scores for a player.
 * For 9-hole rounds: use the gross score directly.
 * For 18-hole rounds (Option B): split into front 9 and back 9 scores.
 */
function getAll9HoleScores(playerId: string, rounds: Round[]): number[] {
  const scores: number[] = [];
  for (const round of rounds) {
    const rp = round.players.find((p) => p.playerId === playerId);
    if (!rp) continue;

    if (isNineHoleRound(round)) {
      scores.push(rp.grossScore);
    } else {
      // Full 18: split into two 9-hole scores
      const front9 = sumHoles(rp.holesData.slice(0, 9));
      const back9 = sumHoles(rp.holesData.slice(9));
      if (front9 > 0) scores.push(front9);
      if (back9 > 0) scores.push(back9);
    }
  }
  return scores;
}

export function computeSeasonStandings(
  players: Player[],
  rounds: Round[]
): SeasonStanding[] {
  return players.map((player) => {
    const playerRounds = rounds.filter((r) =>
      r.players.some((p) => p.playerId === player.id)
    );

    const all9Scores = getAll9HoleScores(player.id, rounds);

    // Wins: lowest gross in the round (comparing apples to apples per round)
    let wins = 0;
    let moneyWon = 0;

    for (const round of playerRounds) {
      const minGross = Math.min(...round.players.map((p) => p.grossScore));
      const rp = round.players.find((p) => p.playerId === player.id)!;
      if (rp.grossScore === minGross) wins++;

      const skinWinner = round.skinsResults.winners.find(
        (w) => w.playerId === player.id
      );
      if (skinWinner) moneyWon += skinWinner.amount;
    }

    return {
      player,
      roundsPlayed: playerRounds.length,
      grossAvg9:
        all9Scores.length > 0
          ? Math.round(
              (all9Scores.reduce((a, b) => a + b, 0) / all9Scores.length) * 10
            ) / 10
          : 0,
      best9: all9Scores.length > 0 ? Math.min(...all9Scores) : 0,
      worst9: all9Scores.length > 0 ? Math.max(...all9Scores) : 0,
      wins,
      moneyWon,
    };
  });
}

export function computeH2H(
  playerId: string,
  players: Player[],
  rounds: Round[]
): H2HRecord[] {
  const opponents = players.filter((p) => p.id !== playerId);

  return opponents.map((opponent) => {
    const sharedRounds = rounds.filter(
      (r) =>
        r.players.some((p) => p.playerId === playerId) &&
        r.players.some((p) => p.playerId === opponent.id)
    );

    let wins = 0,
      losses = 0,
      ties = 0;

    for (const round of sharedRounds) {
      const me = round.players.find((p) => p.playerId === playerId)!;
      const them = round.players.find((p) => p.playerId === opponent.id)!;

      if (me.grossScore < them.grossScore) wins++;
      else if (me.grossScore > them.grossScore) losses++;
      else ties++;
    }

    return {
      opponent,
      wins,
      losses,
      ties,
    };
  });
}

export function getPlayerRoundScores(
  playerId: string,
  rounds: Round[]
): { date: string; course: string; gross: number; front9: number; back9: number; nineHole: boolean }[] {
  return rounds
    .filter((r) => r.players.some((p) => p.playerId === playerId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => {
      const rp = r.players.find((p) => p.playerId === playerId)!;
      const front9 = sumHoles(rp.holesData.slice(0, 9));
      const back9 = sumHoles(rp.holesData.slice(9));
      return {
        date: r.date,
        course: r.course,
        gross: rp.grossScore,
        front9,
        back9,
        nineHole: isNineHoleRound(r),
      };
    });
}

export function getCompareData(
  player1Id: string,
  player2Id: string,
  rounds: Round[]
) {
  const sharedRounds = rounds
    .filter(
      (r) =>
        r.players.some((p) => p.playerId === player1Id) &&
        r.players.some((p) => p.playerId === player2Id)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return sharedRounds.map((r) => {
    const p1 = r.players.find((p) => p.playerId === player1Id)!;
    const p2 = r.players.find((p) => p.playerId === player2Id)!;
    const p1Front = sumHoles(p1.holesData.slice(0, 9));
    const p1Back = sumHoles(p1.holesData.slice(9));
    const p2Front = sumHoles(p2.holesData.slice(0, 9));
    const p2Back = sumHoles(p2.holesData.slice(9));

    return {
      date: r.date,
      course: r.course,
      p1Gross: p1.grossScore,
      p2Gross: p2.grossScore,
      grossDiff: p1.grossScore - p2.grossScore,
      p1Front,
      p1Back,
      p2Front,
      p2Back,
      nineHole: isNineHoleRound(r),
    };
  });
}
