/**
 * Represents a single set in a workout exercise
 */
export interface WorkoutSet {
  /** Number of repetitions for this set */
  reps: number;
  /** Whether this set has been completed */
  completed: boolean;
}

/**
 * Represents a workout exercise with multiple sets
 */
export interface Exercise {
  /** Name of the exercise (e.g., "Bench Press") */
  name: string;
  /** Weight being lifted */
  weight: number;
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
  // Calculate derived state
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const nextSet = exercise.sets[exercise.currentSetIndex];
  const isResting = restTimeRemaining !== undefined && restTimeRemaining > 0;

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Dynamic card classes based on variant
  const getCardClasses = () => {
    const baseClasses =
      "relative flex flex-col gap-4 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border";

    const variantClasses = {
      active:
        "bg-gradient-to-br from-white to-gray-50 border-gray-100 hover:-translate-y-1 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700",
      resting:
        "bg-gradient-to-br from-white to-gray-50 border-gray-100 ring-2 ring-orange-400 ring-offset-2 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 dark:ring-offset-gray-950",
      completed:
        "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800",
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <div className={getCardClasses()}>
      {/* Header with name and rest timer */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
          {personName}
        </h3>
        {isResting && restTimeRemaining !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-sm animate-pulse">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatTime(restTimeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Exercise info */}
      <div className="flex flex-col gap-1">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {exercise.name}
        </h4>
        <div className="text-4xl font-extrabold text-gray-900 dark:text-white">
          {exercise.weight}{" "}
          <span className="text-2xl text-gray-500 dark:text-gray-400">
            {exercise.weightUnit}
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 flex-wrap">
          {exercise.sets.map((set, index) => (
            <button
              key={index}
              onClick={() => !set.completed && onSetComplete?.(index)}
              disabled={set.completed}
              className={`text-2xl transition-transform duration-200 ${
                set.completed
                  ? "text-green-500 dark:text-green-400"
                  : "text-gray-300 dark:text-gray-600 cursor-pointer hover:scale-110"
              } ${set.completed ? "cursor-default" : ""}`}
              aria-label={`Set ${index + 1}: ${set.reps} reps ${set.completed ? "completed" : "pending"}`}
            >
              {set.completed ? "●" : "○"}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedSets} / {totalSets} sets completed
        </div>
      </div>

      {/* Next action badge */}
      {nextSet && !nextSet.completed && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 w-fit">
          <svg
            className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
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
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Next: {nextSet.reps} reps
          </span>
        </div>
      )}
    </div>
  );
};
