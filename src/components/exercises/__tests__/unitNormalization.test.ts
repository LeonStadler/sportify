import { describe, expect, it } from "vitest";

import {
  extractNormalizedExerciseUnits,
  normalizeExerciseUnit,
} from "@/components/exercises/unitNormalization";

describe("exercise unit normalization", () => {
  it("normalizes time aliases to sec/min", () => {
    expect(normalizeExerciseUnit("seconds")).toBe("sec");
    expect(normalizeExerciseUnit("Sekunden")).toBe("sec");
    expect(normalizeExerciseUnit("minute")).toBe("min");
    expect(normalizeExerciseUnit("Minuten")).toBe("min");
  });

  it("normalizes distance aliases to km/m/miles", () => {
    expect(normalizeExerciseUnit("kilometer")).toBe("km");
    expect(normalizeExerciseUnit("meters")).toBe("m");
    expect(normalizeExerciseUnit("Meilen")).toBe("miles");
  });

  it("extracts normalized values from mixed unitOptions payloads", () => {
    const units = extractNormalizedExerciseUnits([
      { value: "seconds", label: "Sekunden" },
      { value: "minute", label: "Minuten" },
      { value: "km", label: "Kilometer" },
    ]);
    expect(units).toEqual(["sec", "min", "km"]);
  });
});
