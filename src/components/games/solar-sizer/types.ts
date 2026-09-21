export type EventId =
  | "sunny_year"
  | "cold_winter"
  | "tariff_cut"
  | "panel_price_drop"
  | "none";

export interface GameEvent {
  id: EventId;
  label: string;
  description: string;
}

export interface SetupInput {
  roofAreaM2: number;
  annualConsumptionKWh: number;
  startingBudgetEUR: number;
  hasGasHeating: boolean;
}

export interface GameState {
  year: number; // current turn, starts at 1
  maxYears: number; // game ends when year exceeds this
  cash: number;
  kwp: number; // installed solar capacity
  hasBattery: boolean;
  hasHeatPump: boolean;
  roofAreaM2: number;
  annualConsumptionKWh: number;
  totalInvested: number;
  cumulativeSavings: number;
  co2SavedKg: number;
  feedInTariffEURPerKWh: number; // can drop over time via events
  costPerKwpEUR: number; // can drop over time via events
  lastEvent: GameEvent | null;
  history: YearResult[];
  isGameOver: boolean;
}

export interface YearResult {
  year: number;
  action: ActionId;
  productionKWh: number;
  selfConsumedKWh: number;
  exportedKWh: number;
  annualSavingsEUR: number;
  cash: number;
  cumulativeSavings: number;
  event: GameEvent | null;
}

export type ActionId =
  | "install_solar"
  | "add_battery"
  | "add_heat_pump"
  | "skip";

export interface ActionDefinition {
  id: ActionId;
  label: string;
  costEUR: number; // may be a function of state in the reducer, this is a display estimate
  disabledReason?: string;
}