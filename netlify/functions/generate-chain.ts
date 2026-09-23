import type { Handler } from "@netlify/functions";

declare const process: {
  env: Record<string, string | undefined>;
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

const PROMPT = `Generate a word chain puzzle: a sequence of exactly 4 short, common English words where each consecutive pair forms a real, well-known compound word or two-word phrase (e.g. sun+flower, flower+bed, bed+time).
Respond with ONLY valid JSON, no other text, in this exact shape:
{"chain": ["word1", "word2", "word3", "word4"]}`;

async function callGroq(): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.9,
      max_completion_tokens: 500,
      reasoning_effort: "low",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log("Groq error body:", errorText);
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  console.log("Groq raw content:", content);

  const cleaned = content.replace(/```json\s*|```/g, "").trim();

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.chain) || parsed.chain.length !== 4) {
    throw new Error("Malformed chain response");
  }
  return parsed.chain.map((w: string) => String(w).trim().toLowerCase());
}

const FALLBACK_CHAINS: string[][] = [
  ["sun", "flower", "bed", "time"],
  ["fire", "fly", "wheel", "barrow"],
  ["door", "bell", "boy", "friend"],
];

export const handler: Handler = async () => {
  try {
    const chain = await callGroq();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chain, source: "ai" }),
    };
  } catch (err) {
    console.log("generate-chain error:", err instanceof Error ? err.message : err);
    const fallback = FALLBACK_CHAINS[Math.floor(Math.random() * FALLBACK_CHAINS.length)];
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chain: fallback, source: "fallback" }),
    };
  }
};