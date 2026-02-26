/**
 * Represents a single set in a workout exercise
 */
export interface WorkoutSet {
  /** Weight for this set */
  weight: number;
  /** Whether this set has been completed */
  completed: boolean;
}

/**
 * Represents a workout exercise with multiple sets
 */
export interface Exercise {
  /** Name of the exercise (e.g., "Bench Press") */
  name: string;
  // @deprecated
  weight?: number;
  /** Unit of weight measurement */
  weightUnit: "lbs" | "kg";
  /** Array of sets for this exercise */
  sets: WorkoutSet[];
  /** Index of the current set being performed */
  currentSetIndex: number;
}

/**
 * Props for the WorkoutCard component
 */
export interface WorkoutCardProps {
  /** Name of the person working out */
  personName: string;
  /** Exercise details */
  exercise: Exercise;
  /** Remaining rest time in seconds (shows rest timer if present) */
  restTimeRemaining?: number;
  /** Visual variant of the card */
  variant?: "active" | "resting" | "completed";
  /** Callback when a set is marked as complete */
  onSetComplete?: (setIndex: number) => void;
}

import styles from "./WorkoutCard.module.scss";

/**
 * A modern, visually appealing workout card component that displays
 * workout progress for a single person.
 *
 * Features:
 * - Gradient backgrounds and modern aesthetics
 * - Animated rest timer
 * - Interactive progress dots
 * - Dark mode support
 * - Multiple visual states (active, resting, completed)
 */
export const WorkoutCard = ({
  personName,
  exercise,
  restTimeRemaining,
  variant = "active",
  onSetComplete,
}: WorkoutCardProps) => {
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const currentSet = exercise.sets[exercise.currentSetIndex];
  const nextSet = exercise.sets[exercise.currentSetIndex + 1] || null;
  const isResting = restTimeRemaining !== undefined && restTimeRemaining > 0;

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      {/* Header with name and rest timer */}
      <div className={styles.header}>
        <h3 className={styles.personName}>
          {personName}
        </h3>
      </div>

      {/* Exercise info */}
      <div className={styles.exerciseInfo}>
        <h4 className={styles.weightDisplay}>
          {currentSet.weight}&nbsp;
          <span className={styles.weightUnit}>
            {exercise.weightUnit}
          </span>
        </h4>
      </div>

      {/* Progress indicator */}
      <div className={styles.progressContainer}>
        <div className={styles.progressDots}>
          {exercise.sets.map((set, index) => (
            <button
              key={index}
              onClick={() => !set.completed && onSetComplete?.(index)}
              disabled={set.completed}
              className={`${styles.dot} ${set.completed ? styles.completed : styles.incomplete}`}
              aria-label={`Set ${index + 1}: ${set.weight} reps ${set.completed ? "completed" : "pending"}`}
            >
              {set.completed ? "●" : "○"}
            </button>
          ))}
        </div>
        <div className={styles.progressText}>
          {completedSets} / {totalSets} sets completed
        </div>
      </div>

      {/* Next action badge */}
      {nextSet && !nextSet.completed && (
        <div className={styles.nextActionBadge}>
          <svg
            className={styles.badgeIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          <span className={styles.badgeText}>
            Next: {nextSet.weight} lbs
          </span>
        </div>
      )}
    </div>
  );
};
