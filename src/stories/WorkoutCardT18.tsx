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
  /** Unit of weight measurement */
  weightUnit: "lbs" | "kg";
  /** Array of sets for this exercise */
  sets: WorkoutSet[];
  /** Index of the current set being performed */
  currentSetIndex: number;
}

/**
 * Props for the WorkoutCardT18 component
 */
export interface WorkoutCardT18Props {
  /** Name of the person working out */
  personName: string;
  /** Exercise details */
  exercise: Exercise;
  /** Whether this card is currently active (their turn) */
  isActive?: boolean;
  /** Callback when a set is marked as complete */
  onSetComplete?: (setIndex: number) => void;
}

/**
 * Calculate the plate breakdown for a given weight
 * Assumes a 45lb barbell and returns pairs of plates needed
 */
const calculatePlates = (totalWeight: number): { weight: number; count: number }[] => {
  const barWeight = 45;
  const weightToLoad = totalWeight - barWeight;
  const perSide = weightToLoad / 2;

  const plateWeights = [45, 25, 10, 5, 2.5];
  const plates: { weight: number; count: number }[] = [];

  let remaining = perSide;

  for (const plateWeight of plateWeights) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      plates.push({ weight: plateWeight, count });
      remaining -= count * plateWeight;
    }
  }

  return plates;
};

/**
 * SVG representation of a weight plate with size based on weight
 */
const WeightPlateSVG = ({ weight }: { weight: number }) => {
  const getSize = () => {
    if (weight >= 45) return { width: 40, height: 40 };
    if (weight >= 25) return { width: 36, height: 36 };
    if (weight >= 10) return { width: 32, height: 32 };
    if (weight >= 5) return { width: 28, height: 28 };
    return { width: 24, height: 24 };
  };

  const getColor = () => {
    if (weight >= 45) return "#EF4444"; // red
    if (weight >= 25) return "#3B82F6"; // blue
    if (weight >= 10) return "#10B981"; // green
    if (weight >= 5) return "#FBBF24"; // yellow
    return "#6B7280"; // gray
  };

  const size = getSize();

  return (
    <svg width={size.width} height={size.height} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill={getColor()} stroke="#1F2937" strokeWidth="2" />
      <circle cx="20" cy="20" r="8" fill="white" fillOpacity="0.3" />
      <circle cx="20" cy="20" r="5" fill="#1F2937" />
    </svg>
  );
};

/**
 * Updated WorkoutCard component for TONY-18
 *
 * Features:
 * - Split layout: Name/Weight on left, Plates breakdown on right
 * - Visual plate representation with SVGs
 * - Set completion dots at bottom
 * - Pulsating orange animation when active
 */
export const WorkoutCardT18 = ({
  personName,
  exercise,
  isActive = false,
  onSetComplete,
}: WorkoutCardT18Props) => {
  const currentSet = exercise.sets[exercise.currentSetIndex];
  const currentWeight = currentSet?.weight || 0;
  const plates = calculatePlates(currentWeight);
  const barWeight = 45;

  return (
    <div
      className={`relative flex flex-col p-6 rounded-2xl shadow-lg hover:shadow-xl border bg-gradient-to-br from-white to-gray-50 border-gray-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 transition-all duration-300 min-w-[600px]
        ${isActive ? 'ring-4 ring-orange-400 ring-offset-2 dark:ring-offset-gray-950 shadow-orange-200 dark:shadow-orange-900' : 'hover:-translate-y-1'}
      `}
      style={
        isActive
          ? {
              animation: 'pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
          : undefined
      }
    >
      <style>{`
        @keyframes pulse-orange {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(251, 146, 60, 0);
          }
          50% {
            box-shadow: 0 0 20px 10px rgba(251, 146, 60, 0.3);
          }
        }
      `}</style>

      {/* Main content - Split layout */}
      <div className="flex gap-8 mb-6">
        {/* Left Half - Name and Weight */}
        <div className="flex-1 flex flex-col justify-between">
          <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            {personName}
          </h3>
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-9xl font-bold text-white dark:text-white leading-none">
              {currentWeight}
            </span>
            <span className="text-3xl text-white dark:text-white">
              {exercise.weightUnit}
            </span>
          </div>
        </div>

        {/* Right Half - Plate Breakdown */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Bar weight */}
          <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm text-white dark:text-white">Bar</div>
            <div className="text-xl font-semibold text-white dark:text-white">
              {barWeight} {exercise.weightUnit}
            </div>
          </div>

          {/* Plates */}
          <div className="flex flex-col gap-2">
            {plates.map((plate, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white dark:text-white">
                    {plate.weight} {exercise.weightUnit}
                  </span>
                  {plate.count > 1 && (
                    <span className="text-xs text-gray-300 dark:text-gray-400">
                      × {plate.count} per side
                    </span>
                  )}
                </div>
                <WeightPlateSVG weight={plate.weight} />
              </div>
            ))}
            {plates.length === 0 && (
              <div className="text-sm text-white dark:text-white">
                Bar only
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom - Set completion dots */}
      <div className="flex justify-center items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {exercise.sets.map((set, index) => (
          <button
            key={index}
            onClick={() => !set.completed && onSetComplete?.(index)}
            disabled={set.completed}
            className={`text-3xl transition-transform duration-200 ${
              set.completed
                ? "text-green-500 dark:text-green-400"
                : "text-gray-300 dark:text-gray-600 cursor-pointer hover:scale-110"
            } ${set.completed ? "cursor-default" : ""}`}
            aria-label={`Set ${index + 1}: ${set.weight} ${exercise.weightUnit} ${set.completed ? "completed" : "pending"}`}
          >
            {set.completed ? "●" : "○"}
          </button>
        ))}
      </div>
    </div>
  );
};
