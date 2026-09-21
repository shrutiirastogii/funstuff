import { useReducer, useState } from "react";
import { gameReducer } from "./reducer";
import { getActionCost, isActionAvailable, getPaybackYear } from "./engine";
import type { ActionId, SetupInput } from "./types";

const ACTIONS: { id: ActionId; label: string; icon: string }[] = [
  { id: "install_solar", label: "Install +1 kWp solar", icon: "☀️" },
  { id: "add_battery", label: "Add battery", icon: "🔋" },
  { id: "add_heat_pump", label: "Add heat pump", icon: "♨️" },
  { id: "skip", label: "Skip year, save cash", icon: "⏭️" },
];

export default function SolarSizer() {
  const [state, dispatch] = useReducer(gameReducer, null);
  const [setupForm, setSetupForm] = useState<SetupInput>({
    roofAreaM2: 40,
    annualConsumptionKWh: 4500,
    startingBudgetEUR: 8000,
    hasGasHeating: true,
  });

  if (!state) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">SolarSizer: Payback Rush</h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-600">
            Roof area (m²)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={setupForm.roofAreaM2}
              onChange={(e) =>
                setSetupForm({ ...setupForm, roofAreaM2: Number(e.target.value) })
              }
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Annual consumption (kWh)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={setupForm.annualConsumptionKWh}
              onChange={(e) =>
                setSetupForm({ ...setupForm, annualConsumptionKWh: Number(e.target.value) })
              }
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Starting budget (€)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={setupForm.startingBudgetEUR}
              onChange={(e) =>
                setSetupForm({ ...setupForm, startingBudgetEUR: Number(e.target.value) })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={setupForm.hasGasHeating}
              onChange={(e) =>
                setSetupForm({ ...setupForm, hasGasHeating: e.target.checked })
              }
            />
            Currently heats with gas
          </label>
          <button
            className="w-full rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
            onClick={() => dispatch({ type: "SETUP", payload: setupForm })}
          >
            Start game
          </button>
        </div>
      </div>
    );
  }

  const paybackYear = getPaybackYear(state);

  if (state.isGameOver) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">Game over</h2>
        <p className="mb-4 text-sm text-slate-500">
          {paybackYear
            ? `You reached payback in year ${paybackYear}.`
            : `You didn't fully pay back your investment within ${state.maxYears} years.`}
        </p>
        <div className="mb-4 grid grid-cols-2 gap-3 text-left text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-400">Total invested</div>
            <div className="font-semibold">€{Math.round(state.totalInvested)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-400">Cumulative savings</div>
            <div className="font-semibold">€{Math.round(state.cumulativeSavings)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-400">CO2 saved</div>
            <div className="font-semibold">{Math.round(state.co2SavedKg)} kg</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-400">Final cash</div>
            <div className="font-semibold">€{Math.round(state.cash)}</div>
          </div>
        </div>
        <button
          className="w-full rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-900"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Play again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Year {state.year} / {state.maxYears}
        </h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          {state.kwp.toFixed(1)} kWp installed
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-400">Cash</div>
          <div className="font-semibold">€{Math.round(state.cash)}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-400">Cumulative savings</div>
          <div className="font-semibold">€{Math.round(state.cumulativeSavings)}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-400">Total invested</div>
          <div className="font-semibold">€{Math.round(state.totalInvested)}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-400">CO2 saved</div>
          <div className="font-semibold">{Math.round(state.co2SavedKg)} kg</div>
        </div>
      </div>

      {state.lastEvent && state.lastEvent.id !== "none" && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <strong>{state.lastEvent.label}:</strong> {state.lastEvent.description}
        </div>
      )}

      <div className="space-y-2">
        {ACTIONS.map((a) => {
          const available = isActionAvailable(state, a.id);
          const cost = getActionCost(state, a.id);
          return (
            <button
              key={a.id}
              disabled={!available}
              onClick={() => dispatch({ type: "PLAY_TURN", payload: a.id })}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                available
                  ? "border-slate-200 hover:border-amber-400 hover:bg-amber-50"
                  : "border-slate-100 bg-slate-50 text-slate-300"
              }`}
            >
              <span>
                {a.icon} {a.label}
              </span>
              <span className="font-medium">{cost > 0 ? `€${cost}` : "Free"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}