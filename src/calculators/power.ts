import { CalcResult, err, ok } from "./types";
import { isPositive, isWithinSanityBounds } from "./validation";
import { current, power, resistance, voltage, CurrentUnit, PowerUnit, ResistanceUnit, VoltageUnit } from "./units";

/**
 * Power / Current calculator.
 *
 * Supports the standard power-triangle relationships:
 *   P = V × I        I = P / V        V = P / I
 *   P = I² × R       P = V² / R
 *
 * The user picks what they know and what they want; this module figures out
 * which formula applies based on which two inputs are present. All math
 * happens in base SI units (V, A, W, Ω) — display units are converted at
 * the boundary.
 */

export type PowerTarget = "voltage" | "current" | "power" | "resistance";

export interface PowerCalcInputs {
  voltage?: { value: number; unit: VoltageUnit } | null;
  current?: { value: number; unit: CurrentUnit } | null;
  power?: { value: number; unit: PowerUnit } | null;
  resistance?: { value: number; unit: ResistanceUnit } | null;
}

export interface PowerCalcResult {
  target: PowerTarget;
  value: number; // in base unit for the target quantity
  unit: "V" | "A" | "W" | "Ω";
  formula: string;
  explanation: string;
}

function toBaseVolts(input: { value: number; unit: VoltageUnit } | null | undefined): number | null {
  if (!input) return null;
  return voltage.toBase(input.value, input.unit);
}
function toBaseAmps(input: { value: number; unit: CurrentUnit } | null | undefined): number | null {
  if (!input) return null;
  return current.toBase(input.value, input.unit);
}
function toBaseWatts(input: { value: number; unit: PowerUnit } | null | undefined): number | null {
  if (!input) return null;
  return power.toBase(input.value, input.unit);
}
function toBaseOhms(input: { value: number; unit: ResistanceUnit } | null | undefined): number | null {
  if (!input) return null;
  return resistance.toBase(input.value, input.unit);
}

export function solvePower(target: PowerTarget, inputs: PowerCalcInputs): CalcResult<PowerCalcResult> {
  const v = toBaseVolts(inputs.voltage);
  const i = toBaseAmps(inputs.current);
  const p = toBaseWatts(inputs.power);
  const r = toBaseOhms(inputs.resistance);

  if (target === "power") {
    if (isPositive(v) && isPositive(i)) {
      return finish(target, v * i, "P = V × I", `Power = Voltage (${v} V) × Current (${i} A)`);
    }
    if (isPositive(i) && isPositive(r)) {
      return finish(target, i * i * r, "P = I² × R", `Power = Current² (${i} A)² × Resistance (${r} Ω)`);
    }
    if (isPositive(v) && isPositive(r)) {
      return finish(target, (v * v) / r, "P = V² / R", `Power = Voltage² (${v} V)² ÷ Resistance (${r} Ω)`);
    }
    return err("Enter two of: voltage, current, resistance to calculate power.");
  }

  if (target === "current") {
    if (isPositive(p) && isPositive(v)) {
      return finish(target, p / v, "I = P / V", `Current = Power (${p} W) ÷ Voltage (${v} V)`);
    }
    if (isPositive(p) && isPositive(r)) {
      return finish(target, Math.sqrt(p / r), "I = √(P / R)", `Current = √(Power (${p} W) ÷ Resistance (${r} Ω))`);
    }
    return err("Enter power and voltage (or power and resistance) to calculate current.");
  }

  if (target === "voltage") {
    if (isPositive(p) && isPositive(i)) {
      return finish(target, p / i, "V = P / I", `Voltage = Power (${p} W) ÷ Current (${i} A)`);
    }
    if (isPositive(p) && isPositive(r)) {
      return finish(target, Math.sqrt(p * r), "V = √(P × R)", `Voltage = √(Power (${p} W) × Resistance (${r} Ω))`);
    }
    return err("Enter power and current (or power and resistance) to calculate voltage.");
  }

  // target === "resistance"
  if (isPositive(v) && isPositive(i)) {
    return finish(target, v / i, "R = V / I", `Resistance = Voltage (${v} V) ÷ Current (${i} A)`);
  }
  if (isPositive(p) && isPositive(i)) {
    return finish(target, p / (i * i), "R = P / I²", `Resistance = Power (${p} W) ÷ Current² (${i} A)²`);
  }
  if (isPositive(p) && isPositive(v)) {
    return finish(target, (v * v) / p, "R = V² / P", `Resistance = Voltage² (${v} V)² ÷ Power (${p} W)`);
  }
  return err("Enter two other values to calculate resistance.");
}

function finish(
  target: PowerTarget,
  value: number,
  formula: string,
  explanation: string
): CalcResult<PowerCalcResult> {
  if (!isWithinSanityBounds(value)) {
    return err("These inputs produce an unrealistic result. Check your values.");
  }
  const unit = target === "voltage" ? "V" : target === "current" ? "A" : target === "power" ? "W" : "Ω";
  return ok({ target, value, unit, formula, explanation });
}
