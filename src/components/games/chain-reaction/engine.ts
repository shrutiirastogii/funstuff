import {type ChainReactionPuzzle,type BlankState } from "./types";

export function createBlanks(puzzle: ChainReactionPuzzle): BlankState[] {
  // first and last words are shown/locked, everything between is a blank
  const middleIndices = puzzle.chain.map((_, i) => i).slice(1, -1);
  return middleIndices.map((index) => ({
    index,
    value: "",
    status: "empty",
    hintLettersRevealed: 0,
  }));
}

export function checkBlank(puzzle: ChainReactionPuzzle, blank: BlankState): BlankState {
  const answer = puzzle.chain[blank.index].trim().toLowerCase();
  const guess = blank.value.trim().toLowerCase();
  if (guess.length === 0) {
    return { ...blank, status: "empty" };
  }
  return { ...blank, status: guess === answer ? "correct" : "incorrect" };
}

export function revealHintLetter(puzzle: ChainReactionPuzzle, blank: BlankState): BlankState {
  const answer = puzzle.chain[blank.index];
  const nextCount = Math.min(blank.hintLettersRevealed + 1, answer.length);
  return {
    ...blank,
    hintLettersRevealed: nextCount,
    status: "revealed",
  };
}

export function getHintPrefix(puzzle: ChainReactionPuzzle, blank: BlankState): string {
  const answer = puzzle.chain[blank.index];
  return answer.slice(0, blank.hintLettersRevealed);
}

export function isPuzzleSolved(blanks: BlankState[]): boolean {
  return blanks.every((b) => b.status === "correct");
}

export function getDisplayWord(puzzle: ChainReactionPuzzle, index: number): string {
  return puzzle.chain[index];
}