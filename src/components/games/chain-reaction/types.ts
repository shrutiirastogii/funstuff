export interface ChainReactionPuzzle {
  id: string;
  chain: string[]; // full solved sequence, e.g. ["sun", "flower", "bed", "time"]
  category?: string;
}

export type BlankStatus = "empty" | "correct" | "incorrect" | "revealed";

export interface BlankState {
  index: number; // position within chain
  value: string; // current player input
  status: BlankStatus;
  hintLettersRevealed: number;
}

export interface GameState {
  puzzle: ChainReactionPuzzle | null;
  blanks: BlankState[];
  attempts: number;
  hintsUsed: number;
  isSolved: boolean;
  isLoading: boolean;
  error: string | null;
}