import { useEffect, useState } from "react";
import type { ParticipantWithSets } from "../db/types";
import { useCompleteSet } from "../hooks/mutations/useSetMutations";
import { useUpdateSessionParticipant } from "../hooks/mutations/useSessionParticipantMutations";
import { formatTime } from "../utils/timeFormat";
import styles from "./WorkoutTimer.module.scss";

interface WorkoutTimerProps {
  participants: ParticipantWithSets[];
}

const REST_TIMER_DURATION = 10; // Initial rest period in seconds - CLEARLY A REST TIMER
const PERIOD_DURATION = 5; // Regular workout period duration

export const WorkoutTimer = ({ participants }: WorkoutTimerProps) => {
  const [isInitialRest, setIsInitialRest] = useState(true); // True during the initial 10-second rest timer
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

  // Handle regular period completion - toggle participants and complete sets
  const handlePeriodComplete = () => {
    // Complete sets for all currently active participants
    const activeParticipants = participants.filter((p) => p.is_active);
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

    // Toggle all participants' is_active flags
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
  };

  // Handle period end when timer reaches 0
  useEffect(() => {
    console.log("getting in here");
    if (timeRemaining > 0) return;
    if (allSetsComplete) {
      setIsRunning(false);
      return;
    }

    if (isInitialRest) {
      // REST TIMER COMPLETE - Initialize active participants
      handleRestTimerComplete();
      setTimeRemaining(PERIOD_DURATION); // Start first workout period
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
      {isInitialRest && (
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
