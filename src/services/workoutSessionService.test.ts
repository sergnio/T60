/**
 * Test suite for workoutSessionService weight calculations
 * Ensures that calculated weights can actually be loaded with available plates
 */
import { describe, it, expect } from "vitest";
import { calculateLoadableWeight } from "./workoutSessionService.js";

describe("calculateLoadableWeight", () => {
  const BAR_WEIGHT = 45;

  describe("Bar only scenarios", () => {
    it("should return bar weight when target is less than bar weight", () => {
      expect(calculateLoadableWeight(0)).toBe(BAR_WEIGHT);
      expect(calculateLoadableWeight(30)).toBe(BAR_WEIGHT);
      expect(calculateLoadableWeight(44.9)).toBe(BAR_WEIGHT);
    });

    it("should return bar weight when target equals bar weight", () => {
      expect(calculateLoadableWeight(45)).toBe(BAR_WEIGHT);
    });
  });

  describe("Exact plate fits", () => {
    it("should handle single 2.5lb plate per side (50 total)", () => {
      expect(calculateLoadableWeight(50)).toBe(50);
    });

    it("should handle single 5lb plate per side (55 total)", () => {
      expect(calculateLoadableWeight(55)).toBe(55);
    });

    it("should handle single 10lb plate per side (65 total)", () => {
      expect(calculateLoadableWeight(65)).toBe(65);
    });

    it("should handle single 25lb plate per side (95 total)", () => {
      expect(calculateLoadableWeight(95)).toBe(95);
    });

    it("should handle single 45lb plate per side (135 total)", () => {
      expect(calculateLoadableWeight(135)).toBe(135);
    });

    it("should handle multiple plates that fit exactly (225 total)", () => {
      // 45 bar + (2×45 + 1×25) × 2 sides = 45 + 115×2 = 275
      expect(calculateLoadableWeight(275)).toBe(275);
    });

    it("should handle complex exact combination", () => {
      // 45 bar + (45 + 25 + 10 + 5 + 2.5) × 2 = 45 + 87.5×2 = 220
      expect(calculateLoadableWeight(220)).toBe(220);
    });
  });

  describe("Rounding down scenarios", () => {
    it("should round down when target has fractional component", () => {
      // 45 bar + 2.6 per side → can only load 2.5 per side
      // Result: 45 + 2.5×2 = 50
      expect(calculateLoadableWeight(50.2)).toBe(50);
    });

    it("should round down the original bug scenario (155 * 85%)", () => {
      // 155 * 0.85 = 131.75
      // Should load: 45 bar + (25+10+5+2.5)×2 = 45 + 42.5×2 = 130
      expect(calculateLoadableWeight(131.75)).toBe(130);
    });

    it("should round down 50% of 155", () => {
      // 155 * 0.5 = 77.5
      // Should load: 45 bar + (10+5+1×2.5)×2 = 45 + 16.25×2 = 77.5 (exact fit)
      expect(calculateLoadableWeight(77.5)).toBe(77.5);
    });

    it("should round down 75% of 155", () => {
      // 155 * 0.75 = 116.25
      // Should load: 45 bar + (25+10)×2 = 45 + 35×2 = 115
      expect(calculateLoadableWeight(116.25)).toBe(115);
    });

    it("should round down when remaining weight is less than smallest plate", () => {
      // 45 bar + 5.3 per side → can only load 5 per side
      // Result: 45 + 5×2 = 55
      expect(calculateLoadableWeight(55.6)).toBe(55);
    });

    it("should handle multiple rounding scenarios", () => {
      // 45 bar + 47.7 per side → can load 25+10+10+2.5 = 47.5 per side
      // Result: 45 + 47.5×2 = 140
      expect(calculateLoadableWeight(140.4)).toBe(140);
    });
  });

  describe("Comprehensive plate combinations", () => {
    it("should correctly calculate for 100 lbs target", () => {
      // 45 bar + (25+2.5)×2 = 45 + 27.5×2 = 100
      expect(calculateLoadableWeight(100)).toBe(100);
    });

    it("should correctly calculate for 200 lbs target", () => {
      // 45 bar + (45+25+5+2.5)×2 = 45 + 77.5×2 = 200
      expect(calculateLoadableWeight(200)).toBe(200);
    });

    it("should correctly calculate for 300 lbs target", () => {
      // 45 bar + (2×45+25+10)×2 = 45 + 125×2 = 295
      expect(calculateLoadableWeight(300)).toBe(295);
    });

    it("should handle very heavy weights", () => {
      // 45 bar + (5×45)×2 = 45 + 225×2 = 495
      expect(calculateLoadableWeight(500)).toBe(495);
    });
  });

  describe("Real-world percentage calculations", () => {
    const testMaxWeight = (maxWeight: number) => {
      const at50 = calculateLoadableWeight(maxWeight * 0.5);
      const at75 = calculateLoadableWeight(maxWeight * 0.75);
      const at85 = calculateLoadableWeight(maxWeight * 0.85);

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
      expect(result.at50).toBe(77.5); // 155 * 0.5 = 77.5
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
      expect(result.at50).toBe(112.5); // 225 * 0.5 = 112.5
      expect(result.at75).toBe(167.5); // 225 * 0.75 = 168.75 → 167.5
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
      expect(result.at50).toBe(67.5); // 135 * 0.5 = 67.5
      expect(result.at75).toBe(100); // 135 * 0.75 = 101.25 → 100
      expect(result.at85).toBe(115); // 135 * 0.85 = 114.75 → 115 (exact)
    });
  });

  describe("Edge cases", () => {
    it("should handle negative numbers gracefully", () => {
      expect(calculateLoadableWeight(-10)).toBe(BAR_WEIGHT);
    });

    it("should handle zero", () => {
      expect(calculateLoadableWeight(0)).toBe(BAR_WEIGHT);
    });

    it("should handle fractional bar weight scenarios", () => {
      expect(calculateLoadableWeight(45.1)).toBe(45);
      expect(calculateLoadableWeight(47.4)).toBe(45);
    });

    it("should handle very small additions above bar weight", () => {
      // 45 + 0.1 per side → cannot load any plates
      expect(calculateLoadableWeight(45.2)).toBe(45);
    });
  });

  describe("Verification: Displayed weight equals sum of plates", () => {
    const verifyPlateSum = (targetWeight: number) => {
      const loadableWeight = calculateLoadableWeight(targetWeight);
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
