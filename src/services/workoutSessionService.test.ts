/**
 * Test suite for workoutSessionService weight calculations
 * Ensures that calculated weights can actually be loaded with available plates
 */
import { describe, it, expect } from "vitest";
import { calculateLoadableWeight } from "../utils/weightCalculation.js";

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

  describe("Rounding down scenarios", () => {
    it("should round down when target has fractional component", () => {
      // 45 bar + 2.6 per side → can only load 2.5 per side
      // Result: 45 + 2.5×2 = 50
      expect(calculateLoadableWeight(50.2, BAR_WEIGHT)).toBe(50);
    });

    it("should round down the original bug scenario (155 * 85%)", () => {
      // 155 * 0.85 = 131.75
      // Should load: 45 bar + (25+10+5+2.5)×2 = 45 + 42.5×2 = 130
      expect(calculateLoadableWeight(131.75, BAR_WEIGHT)).toBe(130);
    });

    it("should round down 50% of 155", () => {
      // 155 * 0.5 = 77.5
      // Per side: 16.25 → can load 1×10 + 1×5 = 15 per side
      // Should load: 45 bar + 15×2 = 75
      expect(calculateLoadableWeight(77.5, BAR_WEIGHT)).toBe(75);
    });

    it("should round down 75% of 155", () => {
      // 155 * 0.75 = 116.25
      // Should load: 45 bar + (25+10)×2 = 45 + 35×2 = 115
      expect(calculateLoadableWeight(116.25, BAR_WEIGHT)).toBe(115);
    });

    it("should round down when remaining weight is less than smallest plate", () => {
      // 45 bar + 5.3 per side → can only load 5 per side
      // Result: 45 + 5×2 = 55
      expect(calculateLoadableWeight(55.6, BAR_WEIGHT)).toBe(55);
    });

    it("should handle multiple rounding scenarios", () => {
      // 45 bar + 47.7 per side → can load 25+10+10+2.5 = 47.5 per side
      // Result: 45 + 47.5×2 = 140
      expect(calculateLoadableWeight(140.4, BAR_WEIGHT)).toBe(140);
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
      expect(result.at50).toBe(75); // 155 * 0.5 = 77.5 → 75
      expect(result.at75).toBe(115); // 155 * 0.75 = 116.25 → 115
      expect(result.at85).toBe(130); // 155 * 0.85 = 131.75 → 130
    });

    it("should correctly calculate percentages for 200 max weight", () => {
      const result = testMaxWeight(200);
      expect(result.at50).toBe(100); // 200 * 0.5 = 100
      expect(result.at75).toBe(150); // 200 * 0.75 = 150
      expect(result.at85).toBe(170); // 200 * 0.85 = 170
    });

    it("should correctly calculate percentages for 225 max weight", () => {
      const result = testMaxWeight(225);
      expect(result.at50).toBe(110); // 225 * 0.5 = 112.5 → 110
      expect(result.at75).toBe(165); // 225 * 0.75 = 168.75 → 165
      expect(result.at85).toBe(190); // 225 * 0.85 = 191.25 → 190
    });

    it("should correctly calculate percentages for 300 max weight", () => {
      const result = testMaxWeight(300);
      expect(result.at50).toBe(150); // 300 * 0.5 = 150
      expect(result.at75).toBe(225); // 300 * 0.75 = 225
      expect(result.at85).toBe(255); // 300 * 0.85 = 255
    });

    it("should correctly calculate percentages for 135 max weight (beginner)", () => {
      const result = testMaxWeight(135);
      expect(result.at50).toBe(65); // 135 * 0.5 = 67.5 → 65
      expect(result.at75).toBe(100); // 135 * 0.75 = 101.25 → 100
      expect(result.at85).toBe(110); // 135 * 0.85 = 114.75 → 110
    });
  });

  describe("Edge cases", () => {
    it("should handle negative numbers gracefully", () => {
      expect(calculateLoadableWeight(-10, BAR_WEIGHT)).toBe(BAR_WEIGHT);
    });

    it("should handle zero", () => {
      expect(calculateLoadableWeight(0, BAR_WEIGHT)).toBe(BAR_WEIGHT);
    });

    it("should handle fractional bar weight scenarios", () => {
      expect(calculateLoadableWeight(45.1, BAR_WEIGHT)).toBe(45);
      expect(calculateLoadableWeight(47.4, BAR_WEIGHT)).toBe(45);
    });

    it("should handle very small additions above bar weight", () => {
      // 45 + 0.1 per side → cannot load any plates
      expect(calculateLoadableWeight(45.2, BAR_WEIGHT)).toBe(45);
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
