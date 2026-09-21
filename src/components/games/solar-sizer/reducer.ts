import type { GameState, SetupInput, ActionId } from "./types";
import { createInitialState, resolveYear } from "./engine";

export type GameAction =
  | { type: "SETUP"; payload: SetupInput }
  | { type: "PLAY_TURN"; payload: ActionId }
  | { type: "RESET" };

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
  switch (action.type) {
    case "SETUP":
      return createInitialState(action.payload);
    case "PLAY_TURN":
      if (!state) return state;
      return resolveYear(state, action.payload);
    case "RESET":
      return null;
    default:
      return state;
  }
}