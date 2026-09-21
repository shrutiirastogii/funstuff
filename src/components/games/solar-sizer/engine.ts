import type {
  GameState,
  SetupInput,
  ActionId,
  YearResult,
  GameEvent,
  EventId,
} from "./types";
import {
  YIELD_KWH_PER_KWP,
  M2_PER_KWP,
  BASE_COST_PER_KWP_EUR,
  RETAIL_ELECTRICITY_RATE_EUR,
  BASE_SELF_CONSUMPTION_RATE,
  BATTERY_SELF_CONSUMPTION_RATE,
  BATTERY_COST_EUR,
  HEAT_PUMP_COST_EUR,
  HEAT_PUMP_GRID_OFFSET_KWH,
  CO2_KG_PER_KWH_GRID,
  DEFAULT_MAX_YEARS,
  GAME_EVENTS,
  EVENT_WEIGHTS,
} from "./constants";

export function createInitialState(input: SetupInput): GameState {
  return {
    year: 1,
    maxYears: DEFAULT_MAX_YEARS,
    cash: input.startingBudgetEUR,
    kwp: 0,
    hasBattery: false,
    hasHeatPump: !input.hasGasHeating,
    roofAreaM2: input.roofAreaM2,
    annualConsumptionKWh: input.annualConsumptionKWh,
    totalInvested: 0,
    cumulativeSavings: 0,
    co2SavedKg: 0,
    feedInTariffEURPerKWh: 0.077,
    costPerKwpEUR: BASE_COST_PER_KWP_EUR,
    lastEvent: null,
    history: [],
    isGameOver: false,
  };
}

function maxInstallableKwp(state: GameState): number {
  return Math.floor((state.roofAreaM2 / M2_PER_KWP) * 10) / 10;
}

function rollEvent(): GameEvent {
  const totalWeight = EVENT_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (const [id, weight] of EVENT_WEIGHTS) {
    if (roll < weight) return GAME_EVENTS[id as EventId];
    roll -= weight;
  }
  return GAME_EVENTS.none;
}

export function getActionCost(state: GameState, action: ActionId): number {
  switch (action) {
    case "install_solar": {
      const room = maxInstallableKwp(state) - state.kwp;
      const stepKwp = Math.min(1, Math.max(room, 0));
      return Math.round(stepKwp * state.costPerKwpEUR);
    }
    case "add_battery":
      return state.hasBattery ? 0 : BATTERY_COST_EUR;
    case "add_heat_pump":
      return state.hasHeatPump ? 0 : HEAT_PUMP_COST_EUR;
    case "skip":
      return 0;
    default:
      return 0;
  }
}

export function isActionAvailable(state: GameState, action: ActionId): boolean {
  const cost = getActionCost(state, action);
  if (action === "install_solar" && state.kwp >= maxInstallableKwp(state)) return false;
  if (action === "add_battery" && state.hasBattery) return false;
  if (action === "add_heat_pump" && state.hasHeatPump) return false;
  return state.cash >= cost;
}

export function resolveYear(state: GameState, action: ActionId): GameState {
  if (state.isGameOver) return state;

  const next: GameState = { ...state };
  const cost = getActionCost(state, action);

  if (!isActionAvailable(state, action) && action !== "skip") {
    return state; // no-op if illegal, UI should prevent this anyway
  }

  if (action === "install_solar") {
    const room = maxInstallableKwp(state) - state.kwp;
    const stepKwp = Math.min(1, Math.max(room, 0));
    next.kwp += stepKwp;
    next.cash -= cost;
    next.totalInvested += cost;
  } else if (action === "add_battery") {
    next.hasBattery = true;
    next.cash -= cost;
    next.totalInvested += cost;
  } else if (action === "add_heat_pump") {
    next.hasHeatPump = true;
    next.cash -= cost;
    next.totalInvested += cost;
  }

  const event = rollEvent();
  next.lastEvent = event;

  let productionKWh = next.kwp * YIELD_KWH_PER_KWP;
  if (event.id === "sunny_year") productionKWh *= 1.15;

  const selfConsumptionRate = next.hasBattery
    ? BATTERY_SELF_CONSUMPTION_RATE
    : BASE_SELF_CONSUMPTION_RATE;

  const selfConsumedKWh = Math.min(
    productionKWh * selfConsumptionRate,
    next.annualConsumptionKWh
  );
  const exportedKWh = Math.max(productionKWh - selfConsumedKWh, 0);

  if (event.id === "tariff_cut") {
    next.feedInTariffEURPerKWh *= 0.95;
  }
  if (event.id === "panel_price_drop") {
    next.costPerKwpEUR *= 0.9;
  }

  let heatingDemandKWh = 0;
  if (!next.hasHeatPump) {
    heatingDemandKWh = event.id === "cold_winter" ? 5500 : 4000;
  } else if (event.id === "cold_winter") {
    heatingDemandKWh = HEAT_PUMP_GRID_OFFSET_KWH * 0.2; // heat pump still draws more grid power in a cold year
  }

  const gridOffsetFromHeatPump = next.hasHeatPump ? HEAT_PUMP_GRID_OFFSET_KWH : 0;

  const annualSavingsEUR =
    selfConsumedKWh * RETAIL_ELECTRICITY_RATE_EUR +
    exportedKWh * next.feedInTariffEURPerKWh +
    gridOffsetFromHeatPump * RETAIL_ELECTRICITY_RATE_EUR * 0.3 - // heat pump efficiency saving vs gas, approx
    heatingDemandKWh * RETAIL_ELECTRICITY_RATE_EUR * (next.hasHeatPump ? 0.1 : 0);

  next.cash += annualSavingsEUR;
  next.cumulativeSavings += annualSavingsEUR;
  next.co2SavedKg += (selfConsumedKWh + exportedKWh) * CO2_KG_PER_KWH_GRID;

  const yearResult: YearResult = {
    year: next.year,
    action,
    productionKWh,
    selfConsumedKWh,
    exportedKWh,
    annualSavingsEUR,
    cash: next.cash,
    cumulativeSavings: next.cumulativeSavings,
    event,
  };

  next.history = [...next.history, yearResult];
  next.year += 1;

  const paidBack = next.cumulativeSavings >= next.totalInvested && next.totalInvested > 0;
  if (next.year > next.maxYears || paidBack) {
    next.isGameOver = true;
  }

  return next;
}

export function getPaybackYear(state: GameState): number | null {
  const found = state.history.find(
    (h) => h.cumulativeSavings >= state.totalInvested && state.totalInvested > 0
  );
  return found ? found.year : null;
}