/**
 * Extended workout set with per-side tracking
 */
export interface WorkoutSet2 {
  /** Number of repetitions for this set */
  reps: number;
  /** Whether this set has been completed */
  completed: boolean;
  /** Whether reps are performed per side (unilateral exercises) */
  perSide?: boolean;
  /** Optional note for the set (e.g., "each side") */
  note?: string;
}

/**
 * Extended exercise interface for WorkoutCard2
 */
export interface Exercise2 {
  /** Name of the exercise (e.g., "Bench Press") */
  name: string;
  /** Weight being lifted */
  weight: number;
  /** Unit of weight measurement */
  weightUnit: "lbs" | "kg";
  /** Array of sets for this exercise */
  sets: WorkoutSet2[];
  /** Index of the current set being performed */
  currentSetIndex: number;
}

/**
 * Type of metric to display prominently
 */
export type DisplayMetricType = 'timer' | 'reps' | 'weight' | 'custom';

/**
 * Configuration for the large central display
 */
export interface DisplayMetric {
  type: DisplayMetricType;
  value: number;
  label: string;
  color?: 'amber' | 'indigo' | 'green';
}

/**
 * Session information displayed at top
 */
export interface SessionInfo {
  format: string;      // e.g., "L30xL", "5x5", "Circuit A"
  currentSet: string;  // e.g., "1st set", "Set 2 of 5"
}

/**
 * Props for WorkoutCard2 component
 */
export interface WorkoutCard2Props {
  personName: string;
  exercise: Exercise2;
  displayMetric: DisplayMetric;
  sessionInfo?: SessionInfo;
  variant?: 'active' | 'resting' | 'completed';
  onSetComplete?: (setIndex: number) => void;
  showTotalWeight?: boolean;
}

import styles from "./WorkoutCard2.module.scss";

/**
 * Dumbbell icon component
 */
const DumbbellIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6.5 6v12M17.5 6v12M6.5 9h11M6.5 15h11M4 7.5h2m0 9H4M18 7.5h2m0 9h-2M3 9h2m0 6H3M19 9h2m0 6h-2" />
  </svg>
);

/**
 * A cleaner, more focused workout card component with a large central metric display.
 *
 * Features:
 * - Large central metric (timer/reps/weight) as primary focus
 * - Session info display (workout protocol)
 * - Per-side tracking for unilateral exercises
 * - Total weight calculation display
 * - No clock icons cluttering the interface
 * - No bottom status/navigation bar
 * - Cleaner visual hierarchy
 */
export const WorkoutCard2 = ({
  personName,
  exercise,
  displayMetric,
  sessionInfo,
  variant = 'active',
  onSetComplete,
  showTotalWeight = false,
}: WorkoutCard2Props) => {
  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total weight lifted
  const calculateTotalWeight = (exercise: Exercise2): number => {
    const completedSets = exercise.sets.filter(s => s.completed);
    return completedSets.reduce((total, set) => {
      const setWeight = exercise.weight * set.reps;
      // If perSide, multiply by 2 (both sides)
      return total + (set.perSide ? setWeight * 2 : setWeight);
    }, 0);
  };

  // Get central metric display value
  const getDisplayValue = () => {
    if (displayMetric.type === 'timer') {
      return formatTime(displayMetric.value);
    }
    return displayMetric.value.toString();
  };

  const totalWeight = calculateTotalWeight(exercise);
  const color = displayMetric.color || 'indigo';

  return (
    <div className={getCardClasses()}>
      {/* 1. TOP SECTION */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Person Name + Session Info */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            {personName}
          </h3>
          {sessionInfo && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {sessionInfo.format} • {sessionInfo.currentSet}
            </div>
          )}
        </div>

        {/* Right: Exercise Name + Weight */}
        <div className="flex flex-col gap-1 items-end">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {exercise.name}
          </h4>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {exercise.weight}{" "}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {exercise.weightUnit}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL DISPLAY (Large & Prominent) */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className={getMetricClasses()}>
          {getDisplayValue()}
        </div>
        <div className={getLabelClasses()}>
          {displayMetric.label}
        </div>
      </div>

      {/* 3. TOTAL WEIGHT (if showTotalWeight) */}
      {showTotalWeight && totalWeight > 0 && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <DumbbellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {totalWeight.toLocaleString()}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {exercise.weightUnit} total
          </span>
        </div>
      )}

      {/* 4. SETS DETAIL */}
      <div className="flex flex-col gap-1">
        {exercise.sets.map((set, index) => (
          <div
            key={index}
            className={`text-sm ${
              set.completed
                ? "text-gray-500 dark:text-gray-500 line-through"
                : index === exercise.currentSetIndex
                ? "text-gray-900 dark:text-white font-semibold"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {set.reps} {set.perSide ? "each side" : "reps"}
            {set.note && ` • ${set.note}`}
          </div>
        ))}
      </div>

      {/* 5. SET INDICATORS */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {exercise.sets.map((set, index) => (
          <button
            key={index}
            onClick={() => !set.completed && onSetComplete?.(index)}
            disabled={set.completed}
            className={`text-3xl transition-all duration-200 ${
              set.completed
                ? "text-green-500 dark:text-green-400"
                : index === exercise.currentSetIndex
                ? "text-indigo-500 dark:text-indigo-400 animate-pulse"
                : "text-gray-300 dark:text-gray-600"
            } ${
              !set.completed ? "cursor-pointer hover:scale-110" : "cursor-default"
            }`}
            aria-label={`Set ${index + 1}: ${set.reps} reps ${set.completed ? "completed" : "pending"}`}
          >
            {set.completed ? "●" : "○"}
          </button>
        ))}
      </div>
    </div>
  );
};
