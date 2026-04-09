# Optional Bar Weight Per Exercise (TONY-99)

## Goal

Replace the hardcoded 45 lb bar weight with a per-exercise `bar_weight` field so that dumbbell, cable, and other non-barbell exercises calculate weights correctly.

## Desired outcome

- Exercises have an optional `bar_weight` column (NULL = no bar, 45 = standard barbell)
- All weight calculations (`calculateLoadableWeight`, `generateSetsConfig`) use the exercise's bar weight instead of a hardcoded 45
- The exercise creation/editing UI includes a bar weight input
- Existing exercises default to 45 via migration
- The duplicated `calculateLoadableWeight` logic is consolidated into a single shared utility

## Approaches considered

### Option A: Patch all 3 locations

- Summary: Add `bar_weight` parameter to each of the 3 duplicated `calculateLoadableWeight` functions and thread it through
- Pros: Minimal diff, no refactoring risk
- Cons: Triples the maintenance surface; any future weight calc change must be made in 3 places
- Failure modes: Drift between the 3 implementations over time

### Option B: Refactor first, then add feature

- Summary: Extract `calculateLoadableWeight` into a shared utility, update all consumers, then add `bar_weight` support in one place
- Pros: DRY, single source of truth for weight math, easier to test
- Cons: Slightly larger diff, touches more files
- Failure modes: Refactor introduces a regression if not tested carefully

## Recommended approach

**Option B** — Refactor first, then add the feature.

- Why: The weight calculation is already duplicated in 3 files. Adding a parameter to all 3 is the wrong time to cement that duplication. Consolidating first means the `bar_weight` logic lives in exactly one place.
- Key tradeoffs: Slightly more work upfront, but the feature change itself becomes trivial.

## Related code

- `src/db/schema.sql` — Exercises table definition (lines 4-10); needs `bar_weight` column
- `src/db/types.ts` — `Exercise` interface (lines 10-15); needs `bar_weight` field
- `src/db/queries.ts` — Exercise CRUD queries; insert/update must handle `bar_weight`
- `src/services/workoutSessionService.ts` — `calculateLoadableWeight()` (line 23), `generateSetsConfig()` (line 64); hardcoded bar weight
- `src/services/rotationService.ts` — Duplicate `calculateLoadableWeight()` (line 38), `generateSetsConfig()` (line 71)
- `src/stories/WorkoutCardT18.tsx` — Third copy of plate calc logic (line 46, line 130)
- `src/components/SessionCreationForm.tsx` — Exercise creation UI; needs bar weight input
- `src/services/workoutSessionService.test.ts` — Existing weight calc tests; must be updated
- `src/hooks/mutations/` — Exercise mutation hooks; may need update for bar_weight param

## Current state

- Bar weight is hardcoded to 45 in 3 locations (2 services + 1 UI component)
- Plate weights array `[45, 25, 10, 5, 2.5]` is also duplicated across those locations
- The `exercises` table has only `id`, `name`, `created_at`, `updated_at`
- Exercise creation is a simple name-only input (no additional fields)
- Weight formula: `targetWeight = maxWeight * percentage`, then `calculateLoadableWeight()` subtracts bar weight, distributes plates, and adds bar weight back

## Structural considerations

**Modularization (PHAME):** `calculateLoadableWeight` is duplicated in `workoutSessionService.ts`, `rotationService.ts`, and `WorkoutCardT18.tsx`. This violates single-source-of-truth. The refactor extracts it into a shared utility (e.g., `src/utils/weightCalculation.ts`) that all three consumers import.

**Encapsulation:** The plate weights array and bar weight constant are implementation details of the weight calculation. They should live with the utility, not be scattered across services.

**Hierarchy:** Services call the utility; the UI component calls the utility. No layer violations.

## Refactoring

### Extract weight calculation utility

**Before feature work.** Create `src/utils/weightCalculation.ts` containing:
- `calculateLoadableWeight(targetWeight: number, barWeight: number): number`
- `PLATE_WEIGHTS` constant
- Any shared weight math helpers

Then update `workoutSessionService.ts`, `rotationService.ts`, and `WorkoutCardT18.tsx` to import from the utility. Run existing tests to confirm no regression.

## Implementation plan

### Phase 1: Refactor (no behavior change)

- [ ] Create `src/utils/weightCalculation.ts` with `calculateLoadableWeight(targetWeight, barWeight)` and `PLATE_WEIGHTS`
- [ ] Update `src/services/workoutSessionService.ts` to import and use the shared utility (pass `45` as barWeight to preserve behavior)
- [ ] Update `src/services/rotationService.ts` to import and use the shared utility
- [ ] Update `src/stories/WorkoutCardT18.tsx` to import and use the shared utility
- [ ] Run existing tests (`yarn test`) — all should pass with no changes

### Phase 2: Database

- [ ] Add `bar_weight` column to `exercises` table in `src/db/schema.sql`: `bar_weight REAL DEFAULT NULL`
- [ ] Write a migration in `src/db/init.ts` (or wherever migrations run) to `ALTER TABLE exercises ADD COLUMN bar_weight REAL DEFAULT 45` so existing rows get 45
- [ ] Add `bar_weight: number | null` to the `Exercise` interface in `src/db/types.ts`
- [ ] Update exercise insert/update queries in `src/db/queries.ts` to accept and persist `bar_weight`

### Phase 3: Service layer

- [ ] Update `generateSetsConfig()` in `workoutSessionService.ts` to fetch the exercise's `bar_weight` and pass it to `calculateLoadableWeight()`
- [ ] Update `generateSetsConfig()` in `rotationService.ts` similarly
- [ ] When `bar_weight` is NULL or 0, pass `0` to `calculateLoadableWeight()` (no bar offset)
- [ ] When `bar_weight` is a positive number, pass that value

### Phase 4: UI

- [ ] Add a "Bar weight (lbs)" numeric input to the exercise creation flow in `SessionCreationForm.tsx` (default 45, clearable to 0/blank)
- [ ] If there is an exercise edit form, add the field there too
- [ ] Update `WorkoutCardT18.tsx` to read `bar_weight` from the exercise data instead of hardcoding 45
- [ ] Create a Storybook story for the bar weight input (per CLAUDE.md: new components need stories)

### Phase 5: Tests

- [ ] Update `workoutSessionService.test.ts` to test with different bar weights (0, 45, custom)
- [ ] Add tests for the new `weightCalculation.ts` utility directly
- [ ] Test edge cases: NULL bar_weight treated as 0, bar_weight = 45 (barbell), bar_weight = 0 (dumbbell/cable)

## Impact assessment

- **Code paths affected:** Exercise creation, set weight calculation during session creation, workout card display, rotation service
- **Data/schema impact:** New nullable column on `exercises` table; migration defaults existing rows to 45 (backward compatible)
- **Dependency/API impact:** None (local SQLite, no external APIs)

## Validation

- **Tests:** `yarn test` — existing tests pass after refactor; new tests cover bar_weight variations
- **Lint/format/typecheck:** `yarn lint` / `yarn typecheck` (if configured)
- **Manual verification:**
  - Create a barbell exercise (bar weight 45) — weights should calculate as before
  - Create a dumbbell exercise (bar weight 0) — weights should NOT subtract/add 45
  - Edit an existing exercise's bar weight — recalculated sets should reflect the change
  - Verify the Storybook story renders correctly

## Open questions

- Should the bar weight field support kg as well, or is lbs-only acceptable for now? (The `person_max_weights` table already has a `unit` column — there may be a unit mismatch if bar weight is always in lbs but max weight is in kg.)
- Should the default bar weight for new exercises be 45, 0, or empty (force the user to choose)? The ticket says "defaults to 45 for barbell" but doesn't specify the global default for all new exercises.
- Is there an exercise edit form currently, or only creation? (The exploration found creation only in `SessionCreationForm.tsx` — if there's no edit flow, we may need to build one or skip that AC for now.)
