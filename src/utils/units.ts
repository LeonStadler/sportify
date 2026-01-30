const KG_PER_LB = 0.45359237;
const KM_PER_MILE = 1.60934;

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
  if (fromUnit === toUnit) return amount;

  let kmAmount = amount;
  if (fromUnit === "m") kmAmount = amount / 1000;
  if (fromUnit === "miles") kmAmount = amount * KM_PER_MILE;

  if (toUnit === "m") return kmAmount * 1000;
  if (toUnit === "miles") return kmAmount / KM_PER_MILE;
  return kmAmount;
};
