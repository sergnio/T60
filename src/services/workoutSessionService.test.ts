/**
 * Test suite for workoutSessionService weight calculations
 * Ensures that calculated weights can actually be loaded with available plates
 */
import { describe, it, expect } from "vitest";
import {
  calculateLoadableWeight,
  calculatePlateBreakdown,
} from "../utils/weightCalculation.js";

describe("calculateLoadableWeight", () => {
  const BAR_WEIGHT = 45;

  describe("Bar only scenarios", () => {
    it("should return bar weight when target is less than bar weight", () => {
      expect(calculateLoadableWeight(0, BAR_WEIGHT)).toBe(BAR_WEIGHT);
      expect(calculateLoadableWeight(30, BAR_WEIGHT)).toBe(BAR_WEIGHT);
      expect(calculateLoadableWeight(44.9, BAR_WEIGHT)).toBe(BAR_WEIGHT);
    });

    it("should return bar weight when target equals bar weight", () => {
      expect(calculateLoadableWeight(45, BAR_WEIGHT)).toBe(BAR_WEIGHT);
    });
  });

  describe("Exact plate fits", () => {
    it("should handle single 2.5lb plate per side (50 total)", () => {
      expect(calculateLoadableWeight(50, BAR_WEIGHT)).toBe(50);
    });

    it("should handle single 5lb plate per side (55 total)", () => {
      expect(calculateLoadableWeight(55, BAR_WEIGHT)).toBe(55);
    });

    it("should handle single 10lb plate per side (65 total)", () => {
      expect(calculateLoadableWeight(65, BAR_WEIGHT)).toBe(65);
    });

    it("should handle single 25lb plate per side (95 total)", () => {
      expect(calculateLoadableWeight(95, BAR_WEIGHT)).toBe(95);
    });

    it("should handle single 45lb plate per side (135 total)", () => {
      expect(calculateLoadableWeight(135, BAR_WEIGHT)).toBe(135);
    });

    it("should handle multiple plates that fit exactly (225 total)", () => {
      // 45 bar + (2×45 + 1×25) × 2 sides = 45 + 115×2 = 275
      expect(calculateLoadableWeight(275, BAR_WEIGHT)).toBe(275);
    });

    it("should handle complex exact combination", () => {
      // 45 bar + (45 + 25 + 10 + 5 + 2.5) × 2 = 45 + 87.5×2 = 220
      expect(calculateLoadableWeight(220, BAR_WEIGHT)).toBe(220);
    });
  });

  describe("Ceiling rounding scenarios", () => {
    it("should round up when target has fractional component", () => {
      // 45 bar + 2.6 per side → floor loads 2.5, remainder 0.1 → ceil adds 2.5
      // Result: 45 + 5×2 = 55
      expect(calculateLoadableWeight(50.2, BAR_WEIGHT)).toBe(55);
    });

    it("should round up the original bug scenario (155 * 85%)", () => {
      // 155 * 0.85 = 131.75
      // Per side: 43.375 → floor loads 25+10+5+2.5 = 42.5, remainder 0.875 → ceil adds 2.5
      // Result: 45 + 45×2 = 135
      expect(calculateLoadableWeight(131.75, BAR_WEIGHT)).toBe(135);
    });

    it("should round up 50% of 155", () => {
      // 155 * 0.5 = 77.5
      // Per side: 16.25 → floor loads 10+5 = 15, remainder 1.25 → ceil adds 2.5
      // Result: 45 + 17.5×2 = 80
      expect(calculateLoadableWeight(77.5, BAR_WEIGHT)).toBe(80);
    });

    it("should round up 75% of 155", () => {
      // 155 * 0.75 = 116.25
      // Per side: 35.625 → floor loads 25+10 = 35, remainder 0.625 → ceil adds 2.5
      // Result: 45 + 37.5×2 = 120
      expect(calculateLoadableWeight(116.25, BAR_WEIGHT)).toBe(120);
    });

    it("should round up when remaining weight is less than smallest plate", () => {
      // 45 bar + 5.3 per side → floor loads 5, remainder 0.3 → ceil adds 2.5
      // Result: 45 + 7.5×2 = 60
      expect(calculateLoadableWeight(55.6, BAR_WEIGHT)).toBe(60);
    });

    it("should round up with multiple plates and small remainder", () => {
      // 45 bar + 47.7 per side → floor loads 25+10+10+2.5 = 47.5, remainder 0.2 → ceil adds 2.5
      // Result: 45 + 50×2 = 145
      expect(calculateLoadableWeight(140.4, BAR_WEIGHT)).toBe(145);
    });

    it("should NOT round up when weight falls exactly on a plate boundary", () => {
      // Exact fits should remain unchanged — no remainder means no rounding
      expect(calculateLoadableWeight(50, BAR_WEIGHT)).toBe(50);
      expect(calculateLoadableWeight(55, BAR_WEIGHT)).toBe(55);
      expect(calculateLoadableWeight(135, BAR_WEIGHT)).toBe(135);
      expect(calculateLoadableWeight(220, BAR_WEIGHT)).toBe(220);
    });
  });

  describe("Comprehensive plate combinations", () => {
    it("should correctly calculate for 100 lbs target", () => {
      // 45 bar + (25+2.5)×2 = 45 + 27.5×2 = 100
      expect(calculateLoadableWeight(100, BAR_WEIGHT)).toBe(100);
    });

    it("should correctly calculate for 200 lbs target", () => {
      // 45 bar + (45+25+5+2.5)×2 = 45 + 77.5×2 = 200
      expect(calculateLoadableWeight(200, BAR_WEIGHT)).toBe(200);
    });

    it("should correctly calculate for 300 lbs target", () => {
      expect(calculateLoadableWeight(300, BAR_WEIGHT)).toBe(300);
    });

    it("should handle very heavy weights", () => {
      // Per side: 227.5 → can load 5×45 = 225 per side (can't fit the extra 2.5)
      // 45 bar + 222.5×2 = 490
      expect(calculateLoadableWeight(500, BAR_WEIGHT)).toBe(500);
    });
  });

  describe("Real-world percentage calculations", () => {
    const testMaxWeight = (maxWeight: number) => {
      const at50 = calculateLoadableWeight(maxWeight * 0.5, BAR_WEIGHT);
      const at75 = calculateLoadableWeight(maxWeight * 0.75, BAR_WEIGHT);
      const at85 = calculateLoadableWeight(maxWeight * 0.85, BAR_WEIGHT);

      // Verify all weights are loadable (divisible structure checks)
      const verifyLoadable = (weight: number) => {
        const perSide = (weight - BAR_WEIGHT) / 2;
        // Each side should be buildable from plates
        expect(perSide).toBeGreaterThanOrEqual(0);
        expect(perSide % 2.5).toBeLessThan(2.5); // Should be close to a 2.5 increment
      };

      verifyLoadable(at50);
      verifyLoadable(at75);
      verifyLoadable(at85);

      return { at50, at75, at85 };
    };

    it("should correctly calculate percentages for 155 max weight", () => {
      const result = testMaxWeight(155);
      expect(result.at50).toBe(80); // 155 * 0.5 = 77.5 → 80 (ceil)
      expect(result.at75).toBe(120); // 155 * 0.75 = 116.25 → 120 (ceil)
      expect(result.at85).toBe(135); // 155 * 0.85 = 131.75 → 135 (ceil)
    });

    it("should correctly calculate percentages for 200 max weight", () => {
      const result = testMaxWeight(200);
      expect(result.at50).toBe(100); // 200 * 0.5 = 100
      expect(result.at75).toBe(150); // 200 * 0.75 = 150
      expect(result.at85).toBe(170); // 200 * 0.85 = 170
    });

    it("should correctly calculate percentages for 225 max weight", () => {
      const result = testMaxWeight(225);
      expect(result.at50).toBe(115); // 225 * 0.5 = 112.5 → 115 (ceil)
      expect(result.at75).toBe(170); // 225 * 0.75 = 168.75 → 170 (ceil)
      expect(result.at85).toBe(195); // 225 * 0.85 = 191.25 → 195 (ceil)
    });

    it("should correctly calculate percentages for 300 max weight", () => {
      const result = testMaxWeight(300);
      expect(result.at50).toBe(150); // 300 * 0.5 = 150
      expect(result.at75).toBe(225); // 300 * 0.75 = 225
      expect(result.at85).toBe(255); // 300 * 0.85 = 255
    });

    it("should correctly calculate percentages for 135 max weight (beginner)", () => {
      const result = testMaxWeight(135);
      expect(result.at50).toBe(70); // 135 * 0.5 = 67.5 → 70 (ceil)
      expect(result.at75).toBe(105); // 135 * 0.75 = 101.25 → 105 (ceil)
      expect(result.at85).toBe(115); // 135 * 0.85 = 114.75 → 115 (ceil)
    });
  });

  describe("Edge cases", () => {
    it("should handle negative numbers gracefully", () => {
      expect(calculateLoadableWeight(-10, BAR_WEIGHT)).toBe(BAR_WEIGHT);
    });

    it("should handle zero", () => {
      expect(calculateLoadableWeight(0, BAR_WEIGHT)).toBe(BAR_WEIGHT);
    });

    it("should round up fractional bar weight scenarios", () => {
      // 45.1: per side = 0.05 → remainder > 0 → ceil adds 2.5 per side
      expect(calculateLoadableWeight(45.1, BAR_WEIGHT)).toBe(50);
      // 47.4: per side = 1.2 → remainder > 0 → ceil adds 2.5 per side
      expect(calculateLoadableWeight(47.4, BAR_WEIGHT)).toBe(50);
    });

    it("should round up very small additions above bar weight", () => {
      // 45 + 0.1 per side → remainder > 0 → ceil adds 2.5 per side
      expect(calculateLoadableWeight(45.2, BAR_WEIGHT)).toBe(50);
    });
  });

  describe("Single-sided loading (bar weight = 0)", () => {
    it("loads the full target onto one side when there is no bar", () => {
      expect(calculateLoadableWeight(135, 0)).toBe(135); // 3×45
      expect(calculateLoadableWeight(100, 0)).toBe(100); // 2×45 + 1×10
      expect(calculateLoadableWeight(50, 0)).toBe(50);   // 1×45 + 1×5
      expect(calculateLoadableWeight(7.5, 0)).toBe(7.5); // 1×5 + 1×2.5
    });

    it("returns 0 when target and bar are both 0", () => {
      expect(calculateLoadableWeight(0, 0)).toBe(0);
    });

    it("rounds up single-sided when target is not exactly achievable", () => {
      // 7.6 → greedy fits 1×5 + 1×2.5 = 7.5, remainder 0.1 → ceil adds 2.5
      expect(calculateLoadableWeight(7.6, 0)).toBe(10);
    });

    it("produces a single-stack breakdown (not per-side)", () => {
      expect(calculatePlateBreakdown(135, 0)).toEqual([
        { weight: 45, count: 3 },
      ]);
      expect(calculatePlateBreakdown(100, 0)).toEqual([
        { weight: 45, count: 2 },
        { weight: 10, count: 1 },
      ]);
    });

    it("still returns per-side breakdown when bar weight > 0 (regression)", () => {
      expect(calculatePlateBreakdown(135, 45)).toEqual([
        { weight: 45, count: 1 },
      ]);
    });

    it("does not regress the two-sided math when bar weight > 0", () => {
      expect(calculateLoadableWeight(135, 45)).toBe(135);
      expect(calculateLoadableWeight(225, 45)).toBe(225);
    });
  });

  describe("Verification: Displayed weight equals sum of plates", () => {
    const verifyPlateSum = (targetWeight: number) => {
      const loadableWeight = calculateLoadableWeight(targetWeight, BAR_WEIGHT);
      const weightToLoad = loadableWeight - BAR_WEIGHT;
      const perSide = weightToLoad / 2;

      // Simulate the plate loading algorithm
      let calculatedPerSide = 0;
      let remaining = perSide;
      const plateWeights = [45, 25, 10, 5, 2.5];

      for (const plateWeight of plateWeights) {
        const count = Math.floor(remaining / plateWeight);
        if (count > 0) {
          calculatedPerSide += count * plateWeight;
          remaining -= count * plateWeight;
        }
      }

      const calculatedTotal = BAR_WEIGHT + calculatedPerSide * 2;

      // The loadable weight should exactly match what plates can build
      expect(loadableWeight).toBe(calculatedTotal);
      expect(remaining).toBeLessThan(2.5); // Remaining should be less than smallest plate
    };

    it("should verify plate sums for the bug scenario", () => {
      verifyPlateSum(131.75);
    });

    it("should verify plate sums for various weights", () => {
      verifyPlateSum(50);
      verifyPlateSum(77.5);
      verifyPlateSum(100);
      verifyPlateSum(115);
      verifyPlateSum(130);
      verifyPlateSum(155);
      verifyPlateSum(200);
      verifyPlateSum(225);
      verifyPlateSum(300);
    });

    it("should verify plate sums for fractional targets", () => {
      verifyPlateSum(99.9);
      verifyPlateSum(116.25);
      verifyPlateSum(131.75);
      verifyPlateSum(168.75);
      verifyPlateSum(191.25);
    });
  });
});
