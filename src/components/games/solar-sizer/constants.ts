import type { GameEvent, EventId } from "./types";

// Real-world-grounded constants (Germany, 2026 baseline)
export const YIELD_KWH_PER_KWP = 1000; // avg annual production per kWp installed
export const M2_PER_KWP = 6; // roof area needed per kWp
export const BASE_COST_PER_KWP_EUR = 1500;
export const RETAIL_ELECTRICITY_RATE_EUR = 0.3; // per kWh
export const BASE_FEED_IN_TARIFF_EUR = 0.077; // per kWh, partial feed-in <=10kWp
export const BASE_SELF_CONSUMPTION_RATE = 0.4; // without battery
export const BATTERY_SELF_CONSUMPTION_RATE = 0.65; // with battery
export const BATTERY_COST_EUR = 6000;
export const HEAT_PUMP_COST_EUR = 15000;
export const HEAT_PUMP_GRID_OFFSET_KWH = 4000; // approx annual gas-equivalent offset
export const CO2_KG_PER_KWH_GRID = 0.38; // German grid emission factor approx
export const DEFAULT_MAX_YEARS = 15;

export const GAME_EVENTS: Record<EventId, GameEvent> = {
  none: { id: "none", label: "Calm year", description: "Nothing unusual happened this year." },
  sunny_year: {
    id: "sunny_year",
    label: "Sunny year",
    description: "Above-average sunshine boosted your solar production by 15%.",
  },
  cold_winter: {
    id: "cold_winter",
    label: "Cold winter",
    description: "A harsh winter increased heating demand and grid reliance.",
  },
  tariff_cut: {
    id: "tariff_cut",
    label: "Feed-in tariff cut",
    description: "Policy change reduced the feed-in tariff by 5%.",
  },
  panel_price_drop: {
    id: "panel_price_drop",
    label: "Panel prices dropped",
    description: "Solar equipment got 10% cheaper this year.",
  },
};

// Weighted event table: [eventId, weight]
export const EVENT_WEIGHTS: [EventId, number][] = [
  ["none", 40],
  ["sunny_year", 20],
  ["cold_winter", 15],
  ["tariff_cut", 15],
  ["panel_price_drop", 10],
];