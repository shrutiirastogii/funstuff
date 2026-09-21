export type Color = "red" | "blue" | "green" | "yellow" | "purple";

export const ALL_COLORS: Color[] = ["red", "blue", "green", "yellow", "purple"];

export const COLOR_HEX: Record<Color, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
};

export interface FlashEvent {
  color: Color;
  isTarget: boolean;
  shownAt: number; // performance.now() timestamp
  clickedAt: number | null;
  result: "hit" | "miss" | "false_click" | "correct_ignore" | "pending";
}

export interface GameSummary {
  totalFlashes: number;
  targetFlashes: number;
  hits: number;
  misses: number;
  falseClicks: number;
  correctIgnores: number;
  avgReactionTimeMs: number | null;
  accuracyPercent: number;
  label: string;
}