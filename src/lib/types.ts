export interface Player {
  id: string;
  name: string;
  handicap: number;
}

export interface RoundPlayer {
  playerId: string;
  grossScore: number;
  netScore?: number; // kept for legacy data, not displayed
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
  holes?: "front9" | "back9" | "full18" | "full";
  players: RoundPlayer[];
  skinsAmount?: number;
  skinsResults?: SkinsResults;
}

export interface SeasonStanding {
  player: Player;
  roundsPlayed: number;
  grossAvg9: number;
  best9: number;
  worst9: number;
  wins: number;
  moneyWon: number;
}

export interface H2HRecord {
  opponent: Player;
  wins: number;
  losses: number;
  ties: number;
}

export interface ParsedScorecard {
  course: string;
  date: string;
  players: {
    name: string;
    scores: (number | null)[];
  }[];
}
