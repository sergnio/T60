import { useEffect, useRef, useState } from "react";
import type { ParticipantWithSets } from "../db/types";
import { useCompleteSet } from "../hooks/mutations/useSetMutations";
import { useUpdateSessionParticipant } from "../hooks/mutations/useSessionParticipantMutations";
import { formatTime } from "../utils/timeFormat";
import styles from "./WorkoutTimer.module.scss";

interface WorkoutTimerProps {
  participants: ParticipantWithSets[];
}

const REST_TIMER_DURATION = 4; // Initial rest period in seconds - CLEARLY A REST TIMER
const PERIOD_DURATION = 2; // Regular workout period duration

export const WorkoutTimer = ({ participants }: WorkoutTimerProps) => {
  const [isInitialRest, setIsInitialRest] = useState(true); // True during the initial 10-second rest timer
  const [isRotationRest, setIsRotationRest] = useState(false); // True during rotation rest timer
  const [hasInitialized, setHasInitialized] = useState(false); // Tracks if participants have been initialized
  const [timeRemaining, setTimeRemaining] = useState(REST_TIMER_DURATION);
  const [isRunning, setIsRunning] = useState(true);

  const completeSet = useCompleteSet();
  const updateParticipant = useUpdateSessionParticipant();

  // Check if all sets are complete - every participant must have completed status
  // (not pending) AND all their sets must be done
  const allSetsComplete =
    participants.length > 0 &&
    participants.every(
      (p) => p.status === "completed" && p.sets.every((s) => s.completed),
    );

  // Stop timer when all sets complete, restart if new active exercises appear (after rotation)
  useEffect(() => {
    if (allSetsComplete) {
      setIsRunning(false);
    } else if (!isRunning && !isInitialRest) {
      // Rotation happened — new active participants appeared, restart timer
      console.log("[WorkoutTimer] New active exercises detected after rotation — restarting timer");
      setIsRunning(true);
      setIsRotationRest(true);
      setTimeRemaining(REST_TIMER_DURATION);
    }
  }, [allSetsComplete, isRunning, isInitialRest]);

  // Handle rest timer completion - is_active is already set correctly by createRotationSession
  const handleRestTimerComplete = () => {
    setIsInitialRest(false);
    setHasInitialized(true);
  };

  // Optimistic rotation detection: predict whether the sets we're about to complete
  // will cause all active participants to have finished all their sets
  const checkForRotation = () => {
    if (participants.length === 0) return false;

    const activeParticipants = participants.filter(
      (p) => p.status === "active",
    );
    if (activeParticipants.length === 0) return false;

    // Check if there are pending exercises to rotate into
    const hasPendingExercises = participants.some(
      (p) => p.status === "pending",
    );
    if (!hasPendingExercises) return false;

    // Predict: after completing the current is_active participants' sets,
    // will ALL active participants have all sets done?
    const allWillBeComplete = activeParticipants.every((p) => {
      if (p.sets.length === 0) return false;

      if (p.is_active) {
        // This participant's current set is about to be completed
        return p.sets.every(
          (s, i) => s.completed || i === p.current_set_index,
        );
      }

      // Non-is_active participants must already have all sets completed
      return p.sets.every((s) => s.completed);
    });

    if (allWillBeComplete) {
      console.log(
        `[WorkoutTimer] All ${activeParticipants.length} active participants will complete all sets - triggering rotation rest`,
      );
    }

    return allWillBeComplete;
  };

  // Handle regular period completion - toggle participants and complete sets
  const handlePeriodComplete = () => {
    console.log("[handlePeriodComplete] === PERIOD COMPLETE ===");
    console.log(
      "[handlePeriodComplete] All participants state:",
      participants.map((p) => ({
        name: p.person.name,
        is_active: p.is_active,
        status: p.status,
        current_set_index: p.current_set_index,
        exercise_id: p.exercise_id,
        completedSets: p.sets.filter((s) => s.completed).length,
        totalSets: p.sets.length,
      })),
    );

    // Complete sets for all currently active participants (must also be at an active exercise)
    const activeParticipants = participants.filter(
      (p) => p.is_active && p.status === "active",
    );
    const firstParticipant = activeParticipants[0];
    const currentSetIndex = firstParticipant?.current_set_index ?? 0;

    console.log(
      "[handlePeriodComplete] Active participants (is_active=true):",
      activeParticipants.map((p) => p.person.name),
    );
    console.log("[handlePeriodComplete] currentSetIndex:", currentSetIndex);

    activeParticipants.forEach((participant) => {
      const currentSet = participant.sets[participant.current_set_index];
      if (currentSet && !currentSet.completed) {
        console.log(
          `COMPLETE SET!!! ${participant.person.name}, set index: ${participant.current_set_index}`,
        );
        completeSet.mutate(currentSet.id);
        console.log("----------------------------------");
      } else {
        console.log(
          `[handlePeriodComplete] SKIPPING ${participant.person.name} - set already completed or doesn't exist`,
          {
            currentSet: !!currentSet,
            completed: currentSet?.completed,
          },
        );
        console.log("----------------------------------");
      }
    });

    // Check if this will trigger a rotation (optimistic)
    const willRotate = checkForRotation();
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

    console.log(
      "[handlePeriodComplete] ALL PARTICIPANTS IN GROUPS:",
      Array.from(exerciseGroups.entries()).map(([exerciseId, group]) => ({
        exerciseId,
        participants: group.map((p) => ({
          name: p.person.name,
          status: p.status,
          is_active: p.is_active,
        })),
      })),
    );

    for (const [exerciseId, group] of exerciseGroups.entries()) {
      const activeInGroup = group.filter((p) => p.status === "active");
      console.log(
        `[handlePeriodComplete] Exercise ${exerciseId}: toggling ${activeInGroup.length} participants:`,
        activeInGroup.map((p) => ({
          name: p.person.name,
          is_active: p.is_active,
          willBecome: !p.is_active,
        })),
      );
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
    console.debug("[WorkoutTimer] useEffect triggered", {
      timeRemaining,
      hasHandledZero: hasHandledZero.current,
      allSetsComplete,
      isInitialRest,
      isRotationRest,
      isRunning,
    });

    if (timeRemaining > 0) {
      console.debug("[WorkoutTimer] Timer still running...");
      hasHandledZero.current = false;
      return;
    }

    if (hasHandledZero.current) {
      console.log(
        "[WorkoutTimer] Already handled zero, skipping to prevent double-handling",
      );
      return;
    }

    console.log("[WorkoutTimer] Timer reached 0!!");
    hasHandledZero.current = true;

    if (allSetsComplete) {
      console.log("[WorkoutTimer] All sets complete - stopping timer");
      setIsRunning(false);
      return;
    }

    if (isInitialRest) {
      // REST TIMER COMPLETE - Initialize active participants
      console.log(
        "[WorkoutTimer] Initial rest timer complete - STARTING FIRST WORKOUT PERIOD!!!",
      );
      handleRestTimerComplete();
      setTimeRemaining(PERIOD_DURATION); // Start first workout period
    } else if (isRotationRest) {
      // ROTATION REST COMPLETE - Resume normal period with new exercise (from API)
      console.log(
        "[WorkoutTimer] Rotation rest complete - resuming normal period with new exercise",
      );
      setIsRotationRest(false);
      setTimeRemaining(PERIOD_DURATION); // Start workout period at new exercise
    } else {
      // Regular period complete - toggle and start next period
      console.log(
        "[WorkoutTimer] Regular period complete - calling handlePeriodComplete",
      );
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
