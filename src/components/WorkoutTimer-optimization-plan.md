# Optimize WorkoutTimer: Consolidate Multiple API Calls into Single Transaction

## Context

The WorkoutTimer component currently makes N+M database calls when a workout period ends:
- N calls to `completeSet.mutate()` for each active participant's current set
- M calls to `updateParticipant.mutate()` for every participant to toggle `is_active` flags

This creates performance issues, multiple cache invalidations, and unnecessary re-renders. The goal is to consolidate this into a single atomic operation where `completeSet` handles both marking a set complete AND rotating turns (flipping `is_active` for all participants in the session).

## Implementation Plan

### 1. Database Layer: Enhance `completeSet` function
**File:** `/Users/sergnio/projects/T60/src/db/queries.ts` (lines 507-515)

Modify `completeSet` to use a transaction that:
1. Updates the set (completed=true, completed_at=timestamp)
2. Gets the participant_id from the set
3. Gets the session_id from the participant
4. Toggles `is_active` for ALL participants in that session using a single UPDATE statement

```typescript
export function completeSet(id: string): Set | null {
  const db = getDatabase();

  return db.transaction(() => {
    const now = Date.now();

    // 1. Get the set to find participant
    const set = getSet(id);
    if (!set) return null;

    // 2. Complete the set
    db.prepare(`
      UPDATE sets
      SET completed = 1, completed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, id);

    // 3. Get participant to find session_id
    const participant = getSessionParticipant(set.participant_id);
    if (!participant) return getSet(id);

    // 4. Toggle is_active for ALL participants in the session
    db.prepare(`
      UPDATE session_participants
      SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
          updated_at = ?
      WHERE session_id = ?
    `).run(now, participant.session_id);

    return getSet(id);
  })();
}
```

**Key Details:**
- Uses `db.transaction()` pattern (established precedent in line 152)
- Single SQL statement toggles ALL participants efficiently: `is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END`
- Returns `Set` to maintain existing API contract
- Atomic operation - either everything succeeds or everything rolls back

### 2. Service Layer: No Changes Required
**File:** `/Users/sergnio/projects/T60/src/services/setService.ts` (lines 92-111)

The existing `completeSet` service function already wraps `queries.completeSet()` with proper error handling. No modifications needed since we're enhancing the DAO layer transparently.

### 3. React Query Hook: Update Cache Invalidation
**File:** `/Users/sergnio/projects/T60/src/hooks/mutations/useSetMutations.ts` (lines 52-80)

The existing `useCompleteSet` hook needs to invalidate participant queries since we're now updating participants:

```typescript
export function useCompleteSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await window.database.completeSet(id);
      return result as Set | null;
    },
    onSuccess: (data) => {
      if (data) {
        // Invalidate set-related queries (existing)
        queryClient.invalidateQueries({
          queryKey: queryKeys.sets.detail(data.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.sets.byParticipant(data.participant_id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionParticipants.withSets(data.participant_id),
        });

        // NEW: Also invalidate active session since we toggled all participants
        queryClient.invalidateQueries({
          queryKey: queryKeys.workoutSessions.activeWithParticipants,
        });

        // NEW: Invalidate all participants in the session (not just this one)
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionParticipants.all,
        });
      }
    },
  });
}
```

### 4. Component: Simplify WorkoutTimer
**File:** `/Users/sergnio/projects/T60/src/components/WorkoutTimer.tsx` (lines 46-73)

Remove the entire loop that calls `updateParticipant.mutate()` since `completeSet` now handles it:

```typescript
// Complete sets for active participants - they handle rotation automatically
for (const participant of activeParticipants) {
  const currentSet = participant.sets[participant.current_set_index];
  if (currentSet && !currentSet.completed) {
    console.log("----");
    console.log(
      "completing set and rotating turns for",
      participant.person.name,
      "set index:",
      participant.current_set_index,
    );
    console.log("----");
    completeSet.mutate(currentSet.id);
  }
}
```

**Changes:**
- Remove lines 61-73 (the entire participant toggle loop)
- Remove `updateParticipant` import (line 4)
- Remove `updateParticipant` hook initialization (line 19)
- Update console log to reflect new behavior
- Keep the loop since we need to complete sets for each active participant

### 5. Type Definitions: Consider adding helper types
**File:** `/Users/sergnio/projects/T60/src/db/types.ts`

No changes strictly required, but could add JSDoc comments to document the new behavior:

```typescript
/**
 * Completes a set and rotates turns by toggling is_active for all
 * participants in the same session. This operation is atomic.
 */
export function completeSet(id: string): Set | null;
```

## Testing & Verification

### Manual Testing Steps:
1. Start a workout session with 2+ participants
2. Let the period timer expire
3. Verify:
   - Active participants' current sets are marked complete
   - ALL participants have their `is_active` flags toggled
   - Only N database calls are made (one per active participant)
   - UI updates correctly with single cache invalidation

### Database Verification:
```sql
-- Before completing a set
SELECT id, is_active FROM session_participants WHERE session_id = ?;

-- After completing one set
-- Verify all is_active flags are flipped
SELECT id, is_active FROM session_participants WHERE session_id = ?;
```

### Edge Cases to Test:
- Set doesn't exist (should return null, no participant updates)
- Participant no longer exists (should complete set but skip toggle)
- Session has only 1 participant (should still toggle that participant)
- Multiple active participants (each completeSet call should toggle all)

## Performance Impact

**Before:**
- 2 active participants, 4 total participants
- Database calls: 2 (sets) + 4 (participants) = 6 calls
- Cache invalidations: 6-12 separate operations

**After:**
- Database calls: 2 (one per active participant, each includes toggle)
- Cache invalidations: 2 operations
- Efficiency gain: ~67% fewer DB calls, 50-75% fewer cache operations

## Critical Files Summary

1. `/Users/sergnio/projects/T60/src/db/queries.ts` - Modify `completeSet` (lines 507-515) to use transaction and toggle participants
2. `/Users/sergnio/projects/T60/src/hooks/mutations/useSetMutations.ts` - Update cache invalidation in `useCompleteSet` (lines 52-80)
3. `/Users/sergnio/projects/T60/src/components/WorkoutTimer.tsx` - Remove participant toggle loop (lines 61-73)

## Alternative Approach (Future Optimization)

If we always complete all active sets together, could create a session-level operation `completeActiveSetsAndRotate(sessionId)` that reduces from N calls to 1 call. However, the current per-set approach maintains better granularity and error handling.