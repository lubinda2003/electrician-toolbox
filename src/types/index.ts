export interface HistoryEntry {
  id: string;
  calculatorId: CalculatorId;
  calculatorLabel: string;
  summary: string;
  /** Serializable snapshot of inputs, used to repeat the calculation. */
  inputs: Record<string, unknown>;
  timestamp: number;
}

export type CalculatorId = "ohms-law" | "power-current" | "voltage-drop" | "generator-load" | "unit-converter";

export interface CalculatorMeta {
  id: CalculatorId;
  path: string;
  emoji: string;
  title: string;
  shortDescription: string;
  pageTitle: string;
  metaDescription: string;
}
