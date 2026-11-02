export type Competition = "League" | "Cup" | "Friendly";

export type MatchStatus = "scheduled" | "first_half" | "half_time" | "second_half" | "full_time";

export type EventType =
  | "kickoff" | "halftime" | "secondhalf" | "fulltime"
  | "goal" | "own_goal" | "yellow" | "red" | "sub" | "note";

export interface MatchEvent {
  id: string;
  type: EventType;
  minute: number;
  side?: "us" | "them";
  player?: number;  // Ascindrix shirt number: scorer, carded player, or player coming off
  player2?: number; // Ascindrix shirt number: assist, or player coming on
  name?: string;    // opponent player name
  note?: string;
}

export interface Lineup {
  starting: number[]; // shirt numbers
  bench: number[];
}

export interface Match {
  id: string;
  date: string; // ISO
  opponent: string;
  home: boolean;
  competition: Competition;
  venue: string;
  score?: { for: number; against: number };
  status?: MatchStatus; // missing on older matches (treated as finished if it has a score)
  lineup?: Lineup;
  events?: MatchEvent[];
}

export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface Player {
  number: number;
  name: string;
  position: Position;
  age: number;
  goals: number;
  assists: number;
  photo?: string;
  team?: "first" | "reserves"; // missing = first team
}

export interface StandingRow {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  isUs?: boolean;
}

// What the admin stores. Played and points are worked out from these.
export interface StandingEntry {
  team: string;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
}
