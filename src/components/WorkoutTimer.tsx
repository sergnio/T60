import { useEffect, useRef, useState } from "react";
import type { ParticipantWithSets } from "../db/types";
import { useCompleteSet } from "../hooks/mutations/useSetMutations";
import { useUpdateSessionParticipant } from "../hooks/mutations/useSessionParticipantMutations";
import { formatTime } from "../utils/timeFormat";
import styles from "./WorkoutTimer.module.scss";

interface WorkoutTimerProps {
  participants: ParticipantWithSets[];
}

const REST_TIMER_DURATION = 7; // Initial rest period in seconds - CLEARLY A REST TIMER
const PERIOD_DURATION = 5; // Regular workout period duration

export const WorkoutTimer = ({ participants }: WorkoutTimerProps) => {
  const [isInitialRest, setIsInitialRest] = useState(true); // True during the initial 10-second rest timer
  const [isRotationRest, setIsRotationRest] = useState(false); // True during rotation rest timer
  const [hasInitialized, setHasInitialized] = useState(false); // Tracks if participants have been initialized
  const [timeRemaining, setTimeRemaining] = useState(REST_TIMER_DURATION);
  const [isRunning, setIsRunning] = useState(true);

  const completeSet = useCompleteSet();
  const updateParticipant = useUpdateSessionParticipant();

  // Check if all sets are complete
  const allSetsComplete = participants.every((p) =>
    p.sets.every((s) => s.completed),
  );

  // Stop timer if all sets are complete
  useEffect(() => {
    if (allSetsComplete) {
      setIsRunning(false);
    }
  }, [allSetsComplete]);

  // Handle rest timer completion - is_active is already set correctly by createRotationSession
  const handleRestTimerComplete = () => {
    setIsInitialRest(false);
    setHasInitialized(true);
  };

  // Check if all participants at an exercise have completed the same set (optimistic rotation detection)
  const checkForRotation = (justCompletedSetIndex: number) => {
    if (participants.length === 0) return false;

    // Group participants by exercise_id
    const exerciseGroups = participants.reduce(
      (acc, p) => {
        const exerciseId = p.exercise_id || "unknown";
        if (!acc[exerciseId]) acc[exerciseId] = [];
        acc[exerciseId].push(p);
        return acc;
      },
      {} as Record<string, typeof participants>,
    );

    // Check each exercise group
    for (const exerciseId in exerciseGroups) {
      const group = exerciseGroups[exerciseId];
      const activeInGroup = group.filter((p) => p.status === "active");

      // Check if all active participants in this group completed the current set
      const allCompletedCurrentSet = activeInGroup.every((p) => {
        const set = p.sets[justCompletedSetIndex];
        return set?.completed;
      });

      if (allCompletedCurrentSet && activeInGroup.length > 0) {
        console.log(
          `[WorkoutTimer] All participants at exercise ${exerciseId} completed set ${justCompletedSetIndex} - triggering rotation rest`,
        );
        return true;
      }
    }

    return false;
  };

  // Handle regular period completion - toggle participants and complete sets
  const handlePeriodComplete = () => {
    console.log("[handlePeriodComplete] === PERIOD COMPLETE ===");
    console.log("[handlePeriodComplete] All participants state:", participants.map(p => ({
      name: p.person.name,
      is_active: p.is_active,
      status: p.status,
      current_set_index: p.current_set_index,
      exercise_id: p.exercise_id,
      completedSets: p.sets.filter(s => s.completed).length,
      totalSets: p.sets.length,
    })));

    // Complete sets for all currently active participants (must also be at an active exercise)
    const activeParticipants = participants.filter((p) => p.is_active && p.status === "active");
    const firstParticipant = activeParticipants[0];
    const currentSetIndex = firstParticipant?.current_set_index ?? 0;

    console.log("[handlePeriodComplete] Active participants (is_active=true):", activeParticipants.map(p => p.person.name));
    console.log("[handlePeriodComplete] currentSetIndex:", currentSetIndex);

    activeParticipants.forEach((participant) => {
      const currentSet = participant.sets[participant.current_set_index];
      if (currentSet && !currentSet.completed) {
        console.log(`[handlePeriodComplete] Completing set for ${participant.person.name}, set index: ${participant.current_set_index}`);
        completeSet.mutate(currentSet.id);
      } else {
        console.log(`[handlePeriodComplete] SKIPPING ${participant.person.name} - set already completed or doesn't exist`, {
          currentSet: !!currentSet,
          completed: currentSet?.completed,
        });
      }
    });

    // Check if this will trigger a rotation (optimistic)
    const willRotate = checkForRotation(currentSetIndex);
    console.log("[handlePeriodComplete] willRotate:", willRotate);

    if (willRotate) {
      // Start rotation rest timer immediately (optimistic)
      console.log("[WorkoutTimer] Starting rotation rest timer");
      setIsRotationRest(true);
      setTimeRemaining(REST_TIMER_DURATION);
      return; // Don't toggle participants - API will handle rotation
    }

    // Toggle is_active within each exercise group independently
    const exerciseGroups = new Map<string, typeof participants>();
    for (const p of participants) {
      const key = p.exercise_id || "unknown";
      if (!exerciseGroups.has(key)) exerciseGroups.set(key, []);
      exerciseGroups.get(key)!.push(p);
    }

    for (const [exerciseId, group] of exerciseGroups.entries()) {
      const activeInGroup = group.filter((p) => p.status === "active");
      console.log(`[handlePeriodComplete] Exercise ${exerciseId}: toggling ${activeInGroup.length} participants:`, activeInGroup.map(p => ({
        name: p.person.name,
        is_active: p.is_active,
        willBecome: !p.is_active,
      })));
      activeInGroup.forEach((participant) => {
        updateParticipant.mutate({
          id: participant.id,
          input: { is_active: !participant.is_active },
        });
      });
    }
  };

  // Guard against re-entry: when mutations resolve and `participants` changes,
  // the effect re-fires with timeRemaining still 0. This ref prevents double-handling.
  const hasHandledZero = useRef(false);

  // Handle period end when timer reaches 0
  useEffect(() => {
    if (timeRemaining > 0) {
      hasHandledZero.current = false;
      return;
    }
    if (hasHandledZero.current) return;
    hasHandledZero.current = true;

    if (allSetsComplete) {
      setIsRunning(false);
      return;
    }

    if (isInitialRest) {
      // REST TIMER COMPLETE - Initialize active participants
      handleRestTimerComplete();
      setTimeRemaining(PERIOD_DURATION); // Start first workout period
    } else if (isRotationRest) {
      // ROTATION REST COMPLETE - Resume normal period with new exercise (from API)
      console.log(
        "[WorkoutTimer] Rotation rest complete - resuming normal period",
      );
      setIsRotationRest(false);
      setTimeRemaining(PERIOD_DURATION); // Start workout period at new exercise
    } else {
      // Regular period complete - toggle and start next period
      handlePeriodComplete();
      setTimeRemaining(PERIOD_DURATION); // Reset timer for next period
    }
  }, [
    timeRemaining,
    participants,
    allSetsComplete,
    isInitialRest,
    isRotationRest,
  ]);

  // Countdown logic
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  return (
    <div className={styles.timerContainer}>
      {(isInitialRest || isRotationRest) && (
        <div className={styles.restIndicator}>REST TIMER</div>
      )}
      <div className={styles.timeDisplay}>{formatTime(timeRemaining)}</div>
      <button
        onClick={() => {
          // toggle one participant for testing, toggle the active flag
          const participant = participants[0];
          updateParticipant.mutate({
            id: participant.id,
            input: { is_active: !participant.is_active },
          });
        }}
      >
        update
      </button>
      {allSetsComplete && (
        <div className={`${styles.statusText} ${styles.completed}`}>
          Workout Complete!
        </div>
      )}
    </div>
  );
};
