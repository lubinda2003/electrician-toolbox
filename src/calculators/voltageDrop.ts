import { CalcResult, err, ok } from "./types";
import { isPositive, isWithinSanityBounds } from "./validation";

/**
 * Voltage Drop calculator.
 *
 * IMPORTANT — SCOPE AND ASSUMPTIONS:
 * This calculator performs a transparent, resistance-only voltage drop
 * estimate. It does NOT look up conductor ampacity, does NOT reference any
 * electrical code, and does NOT determine code compliance. Conductor
 * resistance must come from the user (a datasheet, or the "known material +
 * cross-section" helper below, which uses published physical resistivity
 * constants — not a code-derived sizing table).
 *
 * The math ignores conductor reactance (inductance), which can matter for
 * larger conductors or long AC runs. This is disclosed in the result.
 *
 * Circuit configuration is never assumed silently — the caller must specify
 * single-phase (2-wire, round-trip) or three-phase.
 */

export type CircuitConfig = "single-phase" | "three-phase";
export type ConductorMaterial = "copper" | "aluminum";

// Published bulk resistivity at ~20°C, Ω·m. These are physical constants
// (not code values) commonly cited in engineering references.
const RESISTIVITY_OHM_METER: Record<ConductorMaterial, number> = {
  copper: 1.68e-8,
  aluminum: 2.82e-8,
};

export interface VoltageDropInputs {
  systemVoltageV: number;
  loadCurrentA: number;
  oneWayLengthM: number;
  circuitConfig: CircuitConfig;
  /** Ohms per meter, one-way. Provide this directly, or use resistanceFromMaterial. */
  resistancePerMeterOhm?: number | null;
  resistanceFromMaterial?: {
    material: ConductorMaterial;
    crossSectionAreaMm2: number;
  } | null;
}

export interface VoltageDropResult {
  voltageDropV: number;
  voltageDropPercent: number;
  loadVoltageV: number;
  pathFactor: number;
  resistancePerMeterOhm: number;
  totalResistanceOhm: number;
  formula: string;
  assumptions: string[];
}

function pathFactor(config: CircuitConfig): number {
  // Single-phase: current flows out and back (2 conductors) => factor 2.
  // Three-phase (balanced): factor √3, per the standard line-to-line drop formula.
  return config === "single-phase" ? 2 : Math.sqrt(3);
}

function resistancePerMeterFromMaterial(material: ConductorMaterial, areaMm2: number): number {
  const areaM2 = areaMm2 * 1e-6;
  return RESISTIVITY_OHM_METER[material] / areaM2;
}

export function calculateVoltageDrop(inputs: VoltageDropInputs): CalcResult<VoltageDropResult> {
  const { systemVoltageV, loadCurrentA, oneWayLengthM, circuitConfig } = inputs;

  if (!isPositive(systemVoltageV)) return err("Enter the system voltage.");
  if (!isPositive(loadCurrentA)) return err("Enter the load current.");
  if (!isPositive(oneWayLengthM)) return err("Enter the one-way conductor length.");

  let resistancePerMeterOhm: number;
  const assumptions: string[] = [];

  if (isPositive(inputs.resistancePerMeterOhm)) {
    resistancePerMeterOhm = inputs.resistancePerMeterOhm;
    assumptions.push("Conductor resistance per meter was entered directly by the user.");
  } else if (
    inputs.resistanceFromMaterial &&
    isPositive(inputs.resistanceFromMaterial.crossSectionAreaMm2)
  ) {
    const { material, crossSectionAreaMm2 } = inputs.resistanceFromMaterial;
    resistancePerMeterOhm = resistancePerMeterFromMaterial(material, crossSectionAreaMm2);
    assumptions.push(
      `Resistance was derived from bulk ${material} resistivity at ~20°C and the entered cross-sectional area. ` +
        `This ignores stranding, temperature rise under load, and skin effect.`
    );
  } else {
    return err(
      "Enter the conductor resistance per meter, or provide conductor material and cross-sectional area."
    );
  }

  const factor = pathFactor(circuitConfig);
  assumptions.push(
    circuitConfig === "single-phase"
      ? "Single-phase, 2-wire circuit: round-trip path factor of 2 applied."
      : "Three-phase, balanced load: path factor of √3 applied to line-to-line drop."
  );
  assumptions.push("Conductor reactance (inductance) is not included — resistance-only estimate.");
  assumptions.push("This result does not determine electrical code compliance.");

  const totalResistanceOhm = resistancePerMeterOhm * oneWayLengthM;
  const voltageDropV = factor * loadCurrentA * totalResistanceOhm;

  if (!isWithinSanityBounds(voltageDropV)) {
    return err("These inputs produce an unrealistic result. Check your values.");
  }

  const voltageDropPercent = (voltageDropV / systemVoltageV) * 100;
  const loadVoltageV = systemVoltageV - voltageDropV;

  return ok({
    voltageDropV,
    voltageDropPercent,
    loadVoltageV,
    pathFactor: factor,
    resistancePerMeterOhm,
    totalResistanceOhm,
    formula:
      circuitConfig === "single-phase"
        ? "Vdrop = 2 × I × L × R_per_meter"
        : "Vdrop = √3 × I × L × R_per_meter",
    assumptions,
  });
}
