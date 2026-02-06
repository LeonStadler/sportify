export const clampNumber = (value, min, max) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

export const getDifficultyFactor = (difficultyTier) => {
  const tier = Number(difficultyTier);
  if (!Number.isFinite(tier) || tier <= 0) return 1;
  return tier / 5; // 1 -> 0.2, 10 -> 2.0
};

export const getBaseFactorForMeasurement = (measurementType) => {
  switch (measurementType) {
    case "time":
      return 1 / 60; // points per second (1 per minute)
    case "distance":
      return 10; // points per km
    case "reps":
    default:
      return 1;
  }
};

export const computePointsPerUnit = ({
  measurementType,
  difficultyTier,
}) => {
  const base = getBaseFactorForMeasurement(measurementType);
  const difficultyFactor = getDifficultyFactor(difficultyTier);
  return Number((base * difficultyFactor).toFixed(4));
};

export const normalizeDurationToSeconds = (durationValue, unit) => {
  const value = Number(durationValue) || 0;
  if (!value) return 0;
  if (unit === "sec" || unit === "seconds") return value;
  if (unit === "min" || unit === "minutes") return value * 60;
  if (unit === "hour" || unit === "hours") return value * 3600;
  return value; // assume seconds
};

export const normalizeDistanceToKm = (distanceValue, unit) => {
  const value = Number(distanceValue) || 0;
  if (!value) return 0;
  if (unit === "m") return value / 1000;
  if (unit === "km") return value;
  if (unit === "miles" || unit === "mi") return value * 1.60934;
  return value; // assume km
};

export const computePersonalFactor = ({
  bodyWeightKg,
  extraWeightKg,
  maxDeviation = 0.2,
}) => {
  const weight = Number(bodyWeightKg);
  const extra = Number(extraWeightKg);
  if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(extra) || extra <= 0) {
    return 1;
  }
  const raw = 1 + extra / weight;
  const min = 1 - maxDeviation;
  const max = 1 + maxDeviation;
  return clampNumber(raw, min, max);
};
