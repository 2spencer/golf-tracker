export interface Player {
  id: string;
  name: string;
  handicap: number;
}

export interface RoundPlayer {
  playerId: string;
  grossScore: number;
  netScore: number;
  holesData: (number | null)[];
}

export interface SkinWinner {
  playerId: string;
  amount: number;
  holes: number[];
}

export interface SkinsResults {
  pot: number;
  winners: SkinWinner[];
}

export interface Round {
  id: string;
  date: string;
  course: string;
  holes?: "front9" | "back9" | "full";
  players: RoundPlayer[];
  skinsResults: SkinsResults;
}

export interface SeasonStanding {
  player: Player;
  roundsPlayed: number;
  grossAvg: number;
  netAvg: number;
  grossWins: number;
  netWins: number;
  moneyWon: number;
  bestGross: number;
  bestNet: number;
}

export interface H2HRecord {
  opponent: Player;
  grossWins: number;
  grossLosses: number;
  grossTies: number;
  netWins: number;
  netLosses: number;
  netTies: number;
}

export interface ParsedScorecard {
  course: string;
  date: string;
  players: {
    name: string;
    scores: (number | null)[];
  }[];
}
