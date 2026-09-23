import { type ChainReactionPuzzle } from "./types";

interface GenerateChainResponse {
  chain: string[];
  source: "ai" | "fallback";
}

export async function fetchGeneratedPuzzle(): Promise<ChainReactionPuzzle> {
  const response = await fetch(`/api/generate-chain?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data: GenerateChainResponse = await response.json();

  if (!Array.isArray(data.chain) || data.chain.length !== 4) {
    throw new Error("Received malformed chain from server");
  }

  return {
    id: `ai-${Date.now()}`,
    chain: data.chain,
    category: data.source,
  };
}