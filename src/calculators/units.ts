/**
 * Unit conversion engine.
 *
 * Convention: every quantity has one canonical "base unit" (SI, generally).
 * `toBase` normalizes a display value into the base unit; `fromBase` converts
 * a base-unit value back into a chosen display unit. All internal
 * calculations should happen in base units — never mix display units
 * directly in a formula.
 */

export type VoltageUnit = "mV" | "V" | "kV";
export type CurrentUnit = "mA" | "A" | "kA";
export type PowerUnit = "W" | "kW" | "MW";
export type ResistanceUnit = "Ω" | "kΩ" | "MΩ";
export type EnergyUnit = "Wh" | "kWh";
export type ChargeUnit = "mAh" | "Ah";
export type FrequencyUnit = "Hz" | "kHz";
export type LengthUnit = "mm" | "cm" | "m" | "km" | "in" | "ft";
export type TemperatureUnit = "C" | "F";

const VOLTAGE_TO_BASE: Record<VoltageUnit, number> = { mV: 1e-3, V: 1, kV: 1e3 };
const CURRENT_TO_BASE: Record<CurrentUnit, number> = { mA: 1e-3, A: 1, kA: 1e3 };
const POWER_TO_BASE: Record<PowerUnit, number> = { W: 1, kW: 1e3, MW: 1e6 };
const RESISTANCE_TO_BASE: Record<ResistanceUnit, number> = { "Ω": 1, "kΩ": 1e3, "MΩ": 1e6 };
const ENERGY_TO_BASE: Record<EnergyUnit, number> = { Wh: 1, kWh: 1e3 };
const CHARGE_TO_BASE: Record<ChargeUnit, number> = { mAh: 1e-3, Ah: 1 };
const FREQUENCY_TO_BASE: Record<FrequencyUnit, number> = { Hz: 1, kHz: 1e3 };

// Length base unit is meters.
const LENGTH_TO_BASE: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
};

function makeLinearConverter<U extends string>(table: Record<U, number>) {
  return {
    toBase(value: number, unit: U): number {
      return value * table[unit];
    },
    fromBase(baseValue: number, unit: U): number {
      return baseValue / table[unit];
    },
  };
}

export const voltage = makeLinearConverter(VOLTAGE_TO_BASE);
export const current = makeLinearConverter(CURRENT_TO_BASE);
export const power = makeLinearConverter(POWER_TO_BASE);
export const resistance = makeLinearConverter(RESISTANCE_TO_BASE);
export const energy = makeLinearConverter(ENERGY_TO_BASE);
export const charge = makeLinearConverter(CHARGE_TO_BASE);
export const frequency = makeLinearConverter(FREQUENCY_TO_BASE);
export const length = makeLinearConverter(LENGTH_TO_BASE);

// Temperature is non-linear (affine), so it gets its own conversion pair.
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (from === to) return value;
  return from === "C" ? celsiusToFahrenheit(value) : fahrenheitToCelsius(value);
}

/** Generic converter registry used by the Unit Converter calculator page. */
export type UnitCategory =
  | "voltage"
  | "current"
  | "power"
  | "resistance"
  | "energy"
  | "charge"
  | "frequency"
  | "length"
  | "temperature";

export const UNIT_OPTIONS: Record<UnitCategory, string[]> = {
  voltage: ["mV", "V", "kV"],
  current: ["mA", "A", "kA"],
  power: ["W", "kW", "MW"],
  resistance: ["Ω", "kΩ", "MΩ"],
  energy: ["Wh", "kWh"],
  charge: ["mAh", "Ah"],
  frequency: ["Hz", "kHz"],
  length: ["mm", "cm", "m", "km", "in", "ft"],
  temperature: ["C", "F"],
};

export function convertInCategory(category: UnitCategory, value: number, from: string, to: string): number {
  switch (category) {
    case "voltage":
      return voltage.fromBase(voltage.toBase(value, from as VoltageUnit), to as VoltageUnit);
    case "current":
      return current.fromBase(current.toBase(value, from as CurrentUnit), to as CurrentUnit);
    case "power":
      return power.fromBase(power.toBase(value, from as PowerUnit), to as PowerUnit);
    case "resistance":
      return resistance.fromBase(resistance.toBase(value, from as ResistanceUnit), to as ResistanceUnit);
    case "energy":
      return energy.fromBase(energy.toBase(value, from as EnergyUnit), to as EnergyUnit);
    case "charge":
      return charge.fromBase(charge.toBase(value, from as ChargeUnit), to as ChargeUnit);
    case "frequency":
      return frequency.fromBase(frequency.toBase(value, from as FrequencyUnit), to as FrequencyUnit);
    case "length":
      return length.fromBase(length.toBase(value, from as LengthUnit), to as LengthUnit);
    case "temperature":
      return convertTemperature(value, from as TemperatureUnit, to as TemperatureUnit);
    default:
      return value;
  }
}
