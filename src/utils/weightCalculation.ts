/**
 * Shared weight calculation utility
 *
 * Centralizes all plate-loading math so that weight calculations live in one
 * place. Services and UI components import from here instead of duplicating
 * the greedy-plate algorithm.
 */

/** Standard plate inventory available on each side of the bar (lbs). */
export const PLATE_WEIGHTS = [45, 25, 10, 5, 2.5] as const;

/**
 * Calculates the actual loadable weight using a greedy plate-fitting algorithm.
 *
 * 1. Subtracts the bar weight from the target to get the weight that must be
 *    distributed across plates.
 * 2. Divides by 2 (plates go on both sides).
 * 3. Greedily fits the largest plates first on one side.
 * 4. Returns bar weight + (loaded per side * 2).
 *
 * When `barWeight` is 0 (e.g. dumbbells, cables) the full target is treated
 * as plate weight with no bar offset.
 *
 * @param targetWeight - The ideal weight the lifter should hit
 * @param barWeight    - Weight of the bar itself (0 for non-barbell exercises)
 */
export function calculateLoadableWeight(
  targetWeight: number,
  barWeight: number,
): number {
  // Weight that needs to come from plates (spread across both sides)
  const weightToLoad = Math.max(0, targetWeight - barWeight);
  const perSide = weightToLoad / 2;

  let loadedPerSide = 0;
  let remaining = perSide;

  for (const plateWeight of PLATE_WEIGHTS) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      loadedPerSide += count * plateWeight;
      remaining -= count * plateWeight;
    }
  }

  return barWeight + loadedPerSide * 2;
}

/**
 * Returns the plate breakdown for a given total weight.
 * Used by UI components to visually display which plates to load.
 *
 * @param totalWeight - The total weight on the bar
 * @param barWeight   - Weight of the bar itself (0 for non-barbell exercises)
 */
export function calculatePlateBreakdown(
  totalWeight: number,
  barWeight: number,
): { weight: number; count: number }[] {
  const weightToLoad = totalWeight - barWeight;
  const perSide = weightToLoad / 2;

  const plates: { weight: number; count: number }[] = [];
  let remaining = perSide;

  for (const plateWeight of PLATE_WEIGHTS) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      plates.push({ weight: plateWeight, count });
      remaining -= count * plateWeight;
    }
  }

  return plates;
}
