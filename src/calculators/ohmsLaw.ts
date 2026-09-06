import { CalcResult, err, ok } from "./types";
import { isPositive, isWithinSanityBounds } from "./validation";

/**
 * Ohm's Law: V = I × R
 *
 * Given any two of {voltage, current, resistance}, this module derives the
 * third. This is basic, universal physics — not a jurisdiction-specific
 * rule — so no code/standard caveats apply here.
 */

export type OhmsLawTarget = "voltage" | "current" | "resistance";

export interface OhmsLawResult {
  target: OhmsLawTarget;
  value: number;
  unit: "V" | "A" | "Ω";
  formula: string;
  explanation: string;
}

export function calculateVoltage(current: number, resistance: number): CalcResult<OhmsLawResult> {
  if (!isPositive(current)) return err("Enter a current greater than zero.");
  if (!isPositive(resistance)) return err("Enter a resistance greater than zero.");

  const value = current * resistance;
  if (!isWithinSanityBounds(value)) return err("These inputs produce an unrealistic result. Check your values.");

  return ok({
    target: "voltage",
    value,
    unit: "V",
    formula: "V = I × R",
    explanation: `Voltage = Current (${current} A) × Resistance (${resistance} Ω)`,
  });
}

export function calculateCurrent(voltage: number, resistance: number): CalcResult<OhmsLawResult> {
  if (!isPositive(voltage)) return err("Enter a voltage greater than zero.");
  if (!isPositive(resistance)) return err("Enter a resistance greater than zero.");

  const value = voltage / resistance;
  if (!isWithinSanityBounds(value)) return err("These inputs produce an unrealistic result. Check your values.");

  return ok({
    target: "current",
    value,
    unit: "A",
    formula: "I = V / R",
    explanation: `Current = Voltage (${voltage} V) ÷ Resistance (${resistance} Ω)`,
  });
}

export function calculateResistance(voltage: number, current: number): CalcResult<OhmsLawResult> {
  if (!isPositive(voltage)) return err("Enter a voltage greater than zero.");
  if (!isPositive(current)) {
    return err("Current cannot be zero — resistance cannot be calculated because that implies infinite resistance.");
  }

  const value = voltage / current;
  if (!isWithinSanityBounds(value)) return err("These inputs produce an unrealistic result. Check your values.");

  return ok({
    target: "resistance",
    value,
    unit: "Ω",
    formula: "R = V / I",
    explanation: `Resistance = Voltage (${voltage} V) ÷ Current (${current} A)`,
  });
}

/**
 * Convenience dispatcher used by the UI: given the two known values and
 * which quantity is missing, route to the correct pure function.
 */
export function solveOhmsLaw(
  target: OhmsLawTarget,
  inputs: { voltage: number | null; current: number | null; resistance: number | null }
): CalcResult<OhmsLawResult> {
  const { voltage, current, resistance } = inputs;

  if (target === "voltage") {
    if (current === null || resistance === null) return err("Enter both current and resistance.");
    return calculateVoltage(current, resistance);
  }
  if (target === "current") {
    if (voltage === null || resistance === null) return err("Enter both voltage and resistance.");
    return calculateCurrent(voltage, resistance);
  }
  if (voltage === null || current === null) return err("Enter both voltage and current.");
  return calculateResistance(voltage, current);
}
