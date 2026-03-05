import { useEffect, useState } from "react";
import type { ParticipantWithSets } from "../db/types";
import { useCompleteSet } from "../hooks/mutations/useSetMutations";
import { useUpdateSessionParticipant } from "../hooks/mutations/useSessionParticipantMutations";
import { formatTime } from "../utils/timeFormat";
import styles from "./WorkoutTimer.module.scss";

interface WorkoutTimerProps {
  participants: ParticipantWithSets[];
}

const PERIOD_DURATION = 5; // seconds (1:30)

export const WorkoutTimer = ({ participants }: WorkoutTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(PERIOD_DURATION);
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

  // Handle period end when timer reaches 0
  useEffect(() => {
    console.log("geting in here");
    if (timeRemaining > 0) return;
    if (allSetsComplete) {
      setIsRunning(false);
      return;
    }

    // Period ended - complete active sets and toggle participants
    const activeParticipants = participants.filter((p) => p.is_active);

    // Complete all active participants' current sets
    for (const participant of activeParticipants) {
      const currentSet = participant.sets[participant.current_set_index];
      if (currentSet && !currentSet.completed) {
        completeSet.mutate(currentSet.id);
      }
    }

    // Toggle all participants' is_active flags
    for (const participant of participants) {
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
    }

    // Reset timer for next period
    setTimeRemaining(PERIOD_DURATION);
  }, [
    timeRemaining,
    participants,
    allSetsComplete,
    completeSet,
    updateParticipant,
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
