import { useEffect, useState } from "react";
import type { ParticipantWithSets } from "../db/types";
import { useCompleteSet } from "../hooks/mutations/useSetMutations";
import { useUpdateSessionParticipant } from "../hooks/mutations/useSessionParticipantMutations";
import { formatTime } from "../utils/timeFormat";
import styles from "./WorkoutTimer.module.scss";

interface WorkoutTimerProps {
  participants: ParticipantWithSets[];
}

const INITIAL_REST_DURATION = 60; // 1:00 rest before workout starts
const REST_DURATION = 90; // 1:30 rest between all sets

function getWorkingSetDuration(setIndex: number): number {
  // Sets 1 & 2 (index 0-1): 1:20, Sets 3-5 (index 2-4): 1:45
  if (setIndex <= 1) return 60 + 20;
  return 60 + 45;
}

export const WorkoutTimer = ({ participants }: WorkoutTimerProps) => {
  const [isInitialRest, setIsInitialRest] = useState(true);
  const [isRotationRest, setIsRotationRest] = useState(false);
  const [isRestBetweenSets, setIsRestBetweenSets] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_REST_DURATION);
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

  // Handle rest timer completion - activate even-indexed participants
  const handleRestTimerComplete = () => {
    // REST TIMER COMPLETE - Activate participants at even indices (0, 2, 4, ...)
    participants.forEach((participant, index) => {
      const shouldBeActive = index % 2 === 0; // Even indices are active

      updateParticipant.mutate({
        id: participant.id,
        input: { is_active: shouldBeActive },
      });
    });

    setIsInitialRest(false); // Exit rest phase
    setHasInitialized(true); // Mark initialization complete
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
    // Complete sets for all currently active participants
    const activeParticipants = participants.filter((p) => p.is_active);
    const firstParticipant = activeParticipants[0];
    const currentSetIndex = firstParticipant?.current_set_index ?? 0;

    activeParticipants.forEach((participant) => {
      const currentSet = participant.sets[participant.current_set_index];
      if (currentSet && !currentSet.completed) {
        console.log("----");
        console.log(
          "completing set for",
          participant.person.name,
          "set index:",
          participant.current_set_index,
        );
        console.log("----");
        completeSet.mutate(currentSet.id);
      }
    });

    // Check if this will trigger a rotation (optimistic)
    const willRotate = checkForRotation(currentSetIndex);

    if (willRotate) {
      // Start rotation rest timer immediately (optimistic)
      console.log("[WorkoutTimer] Starting rotation rest timer");
      setIsRotationRest(true);
      setTimeRemaining(REST_DURATION);
      return; // Don't toggle participants - API will handle rotation
    }

    // Toggle all participants' is_active flags and enter rest
    participants.forEach((participant) => {
      console.log(
        "gonna toggle!",
        participant.person.name,
        "currently active:",
        participant.is_active,
      );
      updateParticipant.mutate({
        id: participant.id,
        input: { is_active: !participant.is_active },
      });
    });

    // Start rest period between sets
    setIsRestBetweenSets(true);
    setTimeRemaining(REST_DURATION);
  };

  // Get the current set index for duration calculation
  const getCurrentSetIndex = () => {
    const activeParticipants = participants.filter((p) => p.is_active);
    return activeParticipants[0]?.current_set_index ?? 0;
  };

  // Handle period end when timer reaches 0
  useEffect(() => {
    if (timeRemaining > 0) return;
    if (allSetsComplete) {
      setIsRunning(false);
      return;
    }

    if (isInitialRest) {
      // REST TIMER COMPLETE - Initialize active participants
      handleRestTimerComplete();
      setTimeRemaining(getWorkingSetDuration(0)); // Start first working set
    } else if (isRotationRest) {
      // ROTATION REST COMPLETE - Resume normal period with new exercise
      console.log(
        "[WorkoutTimer] Rotation rest complete - resuming normal period",
      );
      setIsRotationRest(false);
      setTimeRemaining(getWorkingSetDuration(getCurrentSetIndex()));
    } else if (isRestBetweenSets) {
      // REST BETWEEN SETS COMPLETE - Start next working period
      setIsRestBetweenSets(false);
      setTimeRemaining(getWorkingSetDuration(getCurrentSetIndex()));
    } else {
      // Working period complete - complete sets and enter rest
      handlePeriodComplete();
    }
  }, [
    timeRemaining,
    participants,
    allSetsComplete,
    isInitialRest,
    isRotationRest,
    isRestBetweenSets,
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
      {(isInitialRest || isRotationRest || isRestBetweenSets) && (
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
