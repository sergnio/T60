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
 * When `barWeight > 0`, plates are loaded symmetrically across two sides of
 * the bar — the weight-to-load is split in half, fit greedily on one side,
 * then doubled.
 *
 * When `barWeight === 0` (dumbbells, cables, single-sleeve plate-loaded
 * machines, etc.) all plates stack on one side. The full remainder is fit
 * greedily without halving or doubling.
 *
 * @param targetWeight - The ideal weight the lifter should hit
 * @param barWeight    - Weight of the bar itself (0 for non-barbell exercises)
 */
export function calculateLoadableWeight(
  targetWeight: number,
  barWeight: number,
): number {
  const weightToLoad = Math.max(0, targetWeight - barWeight);
  const singleSided = barWeight === 0;
  const perStack = singleSided ? weightToLoad : weightToLoad / 2;

  let loadedPerStack = 0;
  let remaining = perStack;

  for (const plateWeight of PLATE_WEIGHTS) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      loadedPerStack += count * plateWeight;
      remaining -= count * plateWeight;
    }
  }

  // Round UP: if there's any leftover weight, add the smallest plate per stack
  const SMALLEST_PLATE = PLATE_WEIGHTS[PLATE_WEIGHTS.length - 1];
  if (remaining > 0) {
    loadedPerStack += SMALLEST_PLATE;
  }

  return barWeight + loadedPerStack * (singleSided ? 1 : 2);
}

/**
 * Returns the plate breakdown for a given total weight.
 * Used by UI components to visually display which plates to load.
 *
 * When `barWeight > 0` the counts represent plates *per side*.
 * When `barWeight === 0` the counts represent the full single-side stack.
 *
 * @param totalWeight - The total weight on the bar
 * @param barWeight   - Weight of the bar itself (0 for non-barbell exercises)
 */
export function calculatePlateBreakdown(
  totalWeight: number,
  barWeight: number,
): { weight: number; count: number }[] {
  const weightToLoad = totalWeight - barWeight;
  const singleSided = barWeight === 0;
  const perStack = singleSided ? weightToLoad : weightToLoad / 2;

  const plates: { weight: number; count: number }[] = [];
  let remaining = perStack;

  for (const plateWeight of PLATE_WEIGHTS) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      plates.push({ weight: plateWeight, count });
      remaining -= count * plateWeight;
    }
  }

  return plates;
}
