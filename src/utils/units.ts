const KG_PER_LB = 0.45359237;
const KM_PER_MILE = 1.60934;
const KM_PER_YARD = 0.0009144;

export const getPrimaryDistanceUnit = (unit?: string | null) => {
  if (!unit) return "km";
  const normalized = String(unit).toLowerCase();
  if (["miles", "mi", "mile"].includes(normalized)) return "miles";
  if (["yards", "yard", "yd"].includes(normalized)) return "miles";
  return "km";
};

export const getPrimaryWeightUnit = (unit?: string | null) => {
  if (!unit) return "kg";
  const normalized = String(unit).toLowerCase();
  if (["lb", "lbs", "pound", "pounds"].includes(normalized)) return "lbs";
  return "kg";
};

export const getPrimaryTemperatureUnit = (unit?: string | null) => {
  if (!unit) return "celsius";
  const normalized = String(unit).toLowerCase();
  if (["f", "fahrenheit"].includes(normalized)) return "fahrenheit";
  return "celsius";
};

export const normalizeDistanceUnit = (unit?: string | null) => {
  if (!unit) return "";
  const normalized = String(unit).toLowerCase();
  if (["m", "meter", "meters", "metre", "metres"].includes(normalized)) return "m";
  if (["yards", "yard", "yd"].includes(normalized)) return "yards";
  if (["miles", "mi", "mile"].includes(normalized)) return "miles";
  if (["km", "kilometer", "kilometers", "kilometre", "kilometres"].includes(normalized)) return "km";
  return normalized;
};

export const convertWeightToKg = (weight: number, unit: string) => {
  if (!Number.isFinite(weight)) return 0;
  if (unit === "lb" || unit === "lbs") return weight * KG_PER_LB;
  return weight;
};

export const convertWeightFromKg = (weight: number, unit: string) => {
  if (!Number.isFinite(weight)) return 0;
  if (unit === "lb" || unit === "lbs") return weight / KG_PER_LB;
  return weight;
};

export const convertDistance = (
  amount: number,
  fromUnit: string,
  toUnit: string
) => {
  if (!Number.isFinite(amount)) return 0;
  const from = normalizeDistanceUnit(fromUnit);
  const to = normalizeDistanceUnit(toUnit);
  if (from === to) return amount;

  let kmAmount = amount;
  if (from === "m") kmAmount = amount / 1000;
  if (from === "miles") kmAmount = amount * KM_PER_MILE;
  if (from === "yards") kmAmount = amount * KM_PER_YARD;

  if (to === "m") return kmAmount * 1000;
  if (to === "miles") return kmAmount / KM_PER_MILE;
  if (to === "yards") return kmAmount / KM_PER_YARD;
  return kmAmount;
};
