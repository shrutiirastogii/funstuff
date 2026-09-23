import { type ChainReactionPuzzle } from "./types";

// Static puzzles used to build and test the frontend before the AI
// generation endpoint exists. Each chain word must form a valid
// compound word or common two-word phrase with its neighbor.
const mockPuzzles: ChainReactionPuzzle[] = [
  { id: "m1", chain: ["sun", "flower", "bed", "time"], category: "compound" },
  { id: "m2", chain: ["fire", "fly", "wheel", "barrow"], category: "compound" },
  { id: "m3", chain: ["door", "bell", "boy", "friend"], category: "compound" },
  { id: "m4", chain: ["rain", "bow", "tie", "break"], category: "compound" },
  { id: "m5", chain: ["moon", "light", "house", "hold"], category: "compound" },
];

export function getRandomMockPuzzle(): ChainReactionPuzzle {
  return mockPuzzles[Math.floor(Math.random() * mockPuzzles.length)];
}

export default mockPuzzles;