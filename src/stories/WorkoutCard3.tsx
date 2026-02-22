/**
 * Props for the WorkoutCard3 component
 */
export interface WorkoutCard3Props {
  /** Name of the person working out */
  personName: string;
  /** Name of the exercise */
  exerciseName: string;
  /** Total weight being lifted */
  totalWeight: number;
  /** Weight of the bar */
  barWeight: number;
  /** Weight unit */
  weightUnit: "lbs" | "kg";
  /** Breakdown of plates per side */
  plates: number[];
  /** Number of sets completed */
  completedSets: number;
  /** Total number of sets */
  totalSets: number;
  /** Visual variant of the card */
  variant?: "active" | "resting" | "completed";
  /** Callback when a set indicator is clicked */
  onSetClick?: (setIndex: number) => void;
}

/**
 * A workout card component focused on plate loading visualization.
 *
 * Features:
 * - Shows the bar weight, total weight, and breakdown of plates per side
 * - Modern gradient backgrounds and dark mode support
 * - Interactive set indicators with hover effects
 * - Multiple visual states (active, resting, completed)
 * - Useful for quick setup at the gym
 */
export const WorkoutCard3 = ({
  personName,
  totalWeight,
  barWeight,
  weightUnit = "lbs",
  plates,
  completedSets,
  totalSets,
  variant = "active",
  onSetClick,
}: WorkoutCard3Props) => {
  // Dynamic card classes based on variant
  const getCardClasses = () => {
    const baseClasses =
      "relative flex flex-col gap-8 p-10 rounded-3xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 w-[450px]";

    const variantClasses = {
      active:
        "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:-translate-y-1 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700",
      resting:
        "bg-gradient-to-br from-white to-gray-50 border-gray-200 ring-2 ring-orange-400 ring-offset-2 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 dark:ring-offset-gray-950",
      completed:
        "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800",
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  const isCompleted = variant === "completed";

  return (
    <div className={getCardClasses()}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
          {personName}
        </h3>
        <div className="flex flex-col items-end">
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            {barWeight}{weightUnit} bar
          </span>
          <div className="w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mt-1 dark:from-indigo-400 dark:to-purple-400" />
        </div>
      </div>

      {/* Main content - Total weight on left, plates on right */}
      <div className="flex items-start justify-between gap-10">
        {/* Total weight - large on the left */}
        <div className="flex-shrink-0">
          <span className="text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {totalWeight}{" "}
            <span className="text-4xl text-gray-500 dark:text-gray-400">
              {weightUnit}
            </span>
          </span>
        </div>

        {/* Plate breakdown on right */}
        <div className="flex flex-col items-end gap-1 mt-2">
          {plates.map((plate, index) => (
            <div
              key={index}
              className="text-2xl font-semibold text-gray-700 dark:text-gray-200 leading-relaxed"
            >
              {plate}
              <span className="text-lg text-gray-500 dark:text-gray-400">
                {weightUnit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Set indicators */}
      <div className="flex items-center gap-4 mt-2">
        {Array.from({ length: totalSets }).map((_, index) => {
          const isSetCompleted = index < completedSets;
          return (
            <button
              key={index}
              onClick={() => !isSetCompleted && onSetClick?.(index)}
              disabled={isSetCompleted}
              className={`w-14 h-14 rounded-full border-4 transition-all duration-200 ${
                isSetCompleted
                  ? "bg-green-500 border-green-600 dark:bg-green-400 dark:border-green-500"
                  : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 cursor-pointer hover:scale-110 hover:border-indigo-400 dark:hover:border-indigo-500"
              } ${isSetCompleted ? "cursor-default" : ""}`}
              aria-label={`Set ${index + 1} ${isSetCompleted ? "completed" : "pending"}`}
            />
          );
        })}
      </div>

      {/* Progress text */}
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
        {completedSets} / {totalSets} sets completed
      </div>
    </div>
  );
};
