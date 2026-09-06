import { CalcResult, err, ok } from "./types";
import { isNonNegative, isWithinSanityBounds } from "./validation";

/**
 * Generator / Load estimator.
 *
 * The user supplies their own device wattages (from nameplates or
 * manufacturer specs). This module never invents "typical" appliance
 * wattages as fact — any presets exposed by the UI must be clearly labeled
 * as examples, sourced from the UI layer, not this engine.
 *
 * Recommended capacity method (explicitly stated, not hidden):
 *   recommendedCapacityW = totalRunningW + (largest single surge contribution)
 * i.e. the generator must sustain everything running, PLUS the extra surge
 * of whichever single device group has the highest starting wattage above
 * its own running wattage (the common "worst-case simultaneous start"
 * assumption for a single generator). This is a stated method, not a
 * universal engineering standard — real installations should follow
 * generator manufacturer sizing guidance.
 */

export interface DeviceEntry {
  id: string;
  name: string;
  runningWatts: number;
  startingWatts: number;
  quantity: number;
}

export interface GeneratorEstimate {
  totalRunningW: number;
  maxStartingW: number;
  recommendedCapacityW: number;
  method: string;
  deviceCount: number;
}

export function calculateGeneratorLoad(devices: DeviceEntry[]): CalcResult<GeneratorEstimate> {
  if (devices.length === 0) {
    return err("Add at least one device to estimate generator load.");
  }

  let totalRunningW = 0;
  let biggestSurgeContribution = 0;
  let deviceCount = 0;

  for (const device of devices) {
    if (!isNonNegative(device.runningWatts)) {
      return err(`"${device.name || "A device"}" needs a running wattage of zero or more.`);
    }
    if (!isNonNegative(device.startingWatts)) {
      return err(`"${device.name || "A device"}" needs a starting wattage of zero or more.`);
    }
    if (!Number.isFinite(device.quantity) || device.quantity < 1) {
      return err(`"${device.name || "A device"}" needs a quantity of at least 1.`);
    }

    const qty = Math.floor(device.quantity);
    const groupRunning = device.runningWatts * qty;
    // Surge contribution: the extra above running wattage this device group
    // demands at the moment of starting, for one unit in the group starting
    // while the rest of the group (and everything else) is already running.
    const groupSurgeExtra = Math.max(0, device.startingWatts - device.runningWatts);

    totalRunningW += groupRunning;
    biggestSurgeContribution = Math.max(biggestSurgeContribution, groupSurgeExtra);
    deviceCount += qty;
  }

  const maxStartingW = totalRunningW + biggestSurgeContribution;
  const recommendedCapacityW = maxStartingW;

  if (!isWithinSanityBounds(recommendedCapacityW)) {
    return err("These inputs produce an unrealistic result. Check your values.");
  }

  return ok({
    totalRunningW,
    maxStartingW,
    recommendedCapacityW,
    method:
      "Recommended capacity = total running watts + the single largest surge (starting − running) among your devices.",
    deviceCount,
  });
}

/**
 * Example presets for the UI. These are clearly-labeled illustrative
 * figures only — actual appliance wattage varies by model and MUST be
 * confirmed against the manufacturer's nameplate or documentation.
 */
export interface DevicePreset {
  name: string;
  runningWatts: number;
  startingWatts: number;
}

export const EXAMPLE_DEVICE_PRESETS: DevicePreset[] = [
  { name: "Refrigerator (example)", runningWatts: 150, startingWatts: 800 },
  { name: "LED light bulb (example)", runningWatts: 10, startingWatts: 10 },
  { name: "Box fan (example)", runningWatts: 100, startingWatts: 200 },
  { name: "Laptop charger (example)", runningWatts: 65, startingWatts: 65 },
  { name: "Window air conditioner (example)", runningWatts: 1200, startingWatts: 3600 },
];
