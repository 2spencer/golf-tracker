import type { Player, Round, SeasonStanding, H2HRecord } from "./types";

export function computeSeasonStandings(
  players: Player[],
  rounds: Round[]
): SeasonStanding[] {
  return players.map((player) => {
    const playerRounds = rounds.filter((r) =>
      r.players.some((p) => p.playerId === player.id)
    );

    const grossScores = playerRounds.map(
      (r) => r.players.find((p) => p.playerId === player.id)!.grossScore
    );
    const netScores = playerRounds.map(
      (r) => r.players.find((p) => p.playerId === player.id)!.netScore
    );

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
        grossScores.length > 0
          ? Math.round(
              (grossScores.reduce((a, b) => a + b, 0) / grossScores.length) * 10
            ) / 10
          : 0,
      netAvg:
        netScores.length > 0
          ? Math.round(
              (netScores.reduce((a, b) => a + b, 0) / netScores.length) * 10
            ) / 10
          : 0,
      grossWins,
      netWins,
      moneyWon,
      bestGross: grossScores.length > 0 ? Math.min(...grossScores) : 0,
      bestNet: netScores.length > 0 ? Math.min(...netScores) : 0,
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
): { date: string; course: string; gross: number; net: number; front9: number; back9: number }[] {
  return rounds
    .filter((r) => r.players.some((p) => p.playerId === playerId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => {
      const rp = r.players.find((p) => p.playerId === playerId)!;
      const front9 = rp.holesData.slice(0, 9).reduce((a, b) => a + b, 0);
      const back9 = rp.holesData.slice(9).reduce((a, b) => a + b, 0);
      return {
        date: r.date,
        course: r.course,
        gross: rp.grossScore,
        net: rp.netScore,
        front9,
        back9,
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
    const p1Front = p1.holesData.slice(0, 9).reduce((a, b) => a + b, 0);
    const p1Back = p1.holesData.slice(9).reduce((a, b) => a + b, 0);
    const p2Front = p2.holesData.slice(0, 9).reduce((a, b) => a + b, 0);
    const p2Back = p2.holesData.slice(9).reduce((a, b) => a + b, 0);

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
    };
  });
}
