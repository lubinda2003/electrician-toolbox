import { CalculatorMeta } from "../types";

export const CALCULATORS: CalculatorMeta[] = [
  {
    id: "ohms-law",
    path: "/ohms-law",
    emoji: "⚡",
    title: "Ohm's Law",
    shortDescription: "Calculate voltage, current or resistance.",
    pageTitle: "Ohm's Law Calculator — Electrician Toolbox",
    metaDescription:
      "Calculate voltage, current, or resistance using Ohm's Law (V = I × R). Fast, offline-capable electrical calculator.",
  },
  {
    id: "power-current",
    path: "/power-current",
    emoji: "🔌",
    title: "Power & Current",
    shortDescription: "Calculate electrical power and current.",
    pageTitle: "Power & Current Calculator — Electrician Toolbox",
    metaDescription:
      "Calculate electrical power, current, voltage, or resistance using P = V×I, P = I²R, and P = V²/R.",
  },
  {
    id: "voltage-drop",
    path: "/voltage-drop",
    emoji: "📉",
    title: "Voltage Drop",
    shortDescription: "Estimate voltage drop and load voltage.",
    pageTitle: "Voltage Drop Calculator — Electrician Toolbox",
    metaDescription:
      "Estimate voltage drop, percentage drop, and load voltage for single-phase or three-phase circuits, with transparent assumptions.",
  },
  {
    id: "generator-load",
    path: "/generator-load",
    emoji: "🔋",
    title: "Generator Load",
    shortDescription: "Estimate total running and starting load.",
    pageTitle: "Generator Load Estimator — Electrician Toolbox",
    metaDescription:
      "Estimate total running load, peak starting load, and recommended generator capacity from your own device list.",
  },
  {
    id: "unit-converter",
    path: "/unit-converter",
    emoji: "🔄",
    title: "Unit Converter",
    shortDescription: "Convert common electrical units.",
    pageTitle: "Electrical Unit Converter — Electrician Toolbox",
    metaDescription:
      "Convert volts, amps, watts, ohms, watt-hours, amp-hours, hertz, length, and temperature units instantly.",
  },
];

export function getCalculatorMeta(id: string): CalculatorMeta | undefined {
  return CALCULATORS.find((c) => c.id === id);
}
