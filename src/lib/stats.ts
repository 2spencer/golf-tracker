import type { Player, Round, SeasonStanding, H2HRecord } from "./types";

function sumHoles(holes: (number | null)[]): number {
  return holes.reduce<number>((a, b) => a + (b ?? 0), 0);
}

function isNineHoleRound(round: Round): boolean {
  return round.holes === "front9" || round.holes === "back9";
}

export function computeSeasonStandings(
  players: Player[],
  rounds: Round[]
): SeasonStanding[] {
  return players.map((player) => {
    const playerRounds = rounds.filter((r) =>
      r.players.some((p) => p.playerId === player.id)
    );

    // Separate 9-hole and 18-hole rounds for averaging
    const fullRounds = playerRounds.filter((r) => !isNineHoleRound(r));
    const nineRounds = playerRounds.filter((r) => isNineHoleRound(r));

    const fullGross = fullRounds.map(
      (r) => r.players.find((p) => p.playerId === player.id)!.grossScore
    );
    const fullNet = fullRounds.map(
      (r) => r.players.find((p) => p.playerId === player.id)!.netScore
    );
    const nineGross = nineRounds.map(
      (r) => r.players.find((p) => p.playerId === player.id)!.grossScore
    );
    const nineNet = nineRounds.map(
      (r) => r.players.find((p) => p.playerId === player.id)!.netScore
    );

    // Normalize 9-hole scores to 18-hole equivalents for averaging
    const allGross = [
      ...fullGross,
      ...nineGross.map((s) => s * 2),
    ];
    const allNet = [
      ...fullNet,
      ...nineNet.map((s) => s * 2),
    ];

    let grossWins = 0;
    let netWins = 0;
    let moneyWon = 0;

    for (const round of playerRounds) {
      const minGross = Math.min(...round.players.map((p) => p.grossScore));
      const minNet = Math.min(...round.players.map((p) => p.netScore));
      const rp = round.players.find((p) => p.playerId === player.id)!;
      if (rp.grossScore === minGross) grossWins++;
      if (rp.netScore === minNet) netWins++;

      const skinWinner = round.skinsResults.winners.find(
        (w) => w.playerId === player.id
      );
      if (skinWinner) moneyWon += skinWinner.amount;
    }

    return {
      player,
      roundsPlayed: playerRounds.length,
      grossAvg:
        allGross.length > 0
          ? Math.round(
              (allGross.reduce((a, b) => a + b, 0) / allGross.length) * 10
            ) / 10
          : 0,
      netAvg:
        allNet.length > 0
          ? Math.round(
              (allNet.reduce((a, b) => a + b, 0) / allNet.length) * 10
            ) / 10
          : 0,
      grossWins,
      netWins,
      moneyWon,
      bestGross: allGross.length > 0 ? Math.min(...allGross) : 0,
      bestNet: allNet.length > 0 ? Math.min(...allNet) : 0,
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

    let grossWins = 0,
      grossLosses = 0,
      grossTies = 0;
    let netWins = 0,
      netLosses = 0,
      netTies = 0;

    for (const round of sharedRounds) {
      const me = round.players.find((p) => p.playerId === playerId)!;
      const them = round.players.find((p) => p.playerId === opponent.id)!;

      if (me.grossScore < them.grossScore) grossWins++;
      else if (me.grossScore > them.grossScore) grossLosses++;
      else grossTies++;

      if (me.netScore < them.netScore) netWins++;
      else if (me.netScore > them.netScore) netLosses++;
      else netTies++;
    }

    return {
      opponent,
      grossWins,
      grossLosses,
      grossTies,
      netWins,
      netLosses,
      netTies,
    };
  });
}

export function getPlayerRoundScores(
  playerId: string,
  rounds: Round[]
): { date: string; course: string; gross: number; net: number; front9: number; back9: number; nineHole: boolean }[] {
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
        net: rp.netScore,
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
      p1Net: p1.netScore,
      p2Net: p2.netScore,
      grossDiff: p1.grossScore - p2.grossScore,
      netDiff: p1.netScore - p2.netScore,
      p1Front,
      p1Back,
      p2Front,
      p2Back,
      nineHole: isNineHoleRound(r),
    };
  });
}
