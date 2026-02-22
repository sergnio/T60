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
const calculatePlates = (
  totalWeight: number,
): { weight: number; count: number }[] => {
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
    <svg
      width={size.width}
      height={size.height}
      viewBox="0 0 40 40"
      fill="none"
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill={getColor()}
        stroke="#1F2937"
        strokeWidth="2"
      />
      <circle cx="20" cy="20" r="8" fill="white" fillOpacity="0.3" />
      <circle cx="20" cy="20" r="5" fill="#1F2937" />
    </svg>
  );
};

import styles from "./WorkoutCardT18.module.scss";

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
    <div className={`${styles.card} ${isActive ? styles.active : ""}`}>
      {/* Main content - Split layout */}
      <div className={styles.mainContent}>
        {/* Left Half - Name and Weight */}
        <div className={styles.leftSection}>
          <h3 className={styles.personName}>{personName}</h3>
          <div className={styles.weightDisplay}>
            <p className={styles.weight}>{currentWeight}</p>
            <p className={styles.weightUnit}>{exercise.weightUnit}</p>
          </div>
        </div>

        {/* Right Half - Plate Breakdown */}
        <div className={styles.rightSection}>
          {/* Bar weight */}
          <div className={styles.barWeight}>
            <div className={styles.label}>Bar</div>
            <div className={styles.value}>
              {barWeight} {exercise.weightUnit}
            </div>
          </div>

          {/* Plates */}
          <div className={styles.plates}>
            {plates.map((plate, index) => (
              <div key={index} className={styles.plateItem}>
                <div className={styles.plateInfo}>
                  <span className={styles.plateWeight}>
                    {plate.weight} {exercise.weightUnit}
                  </span>
                  {plate.count > 1 && (
                    <span className={styles.plateCount}>
                      × {plate.count} per side
                    </span>
                  )}
                </div>
                <WeightPlateSVG weight={plate.weight} />
              </div>
            ))}
            {plates.length === 0 && (
              <div className={styles.barOnly}>Bar only</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom - Set completion dots */}
      <div className={styles.progressDots}>
        {exercise.sets.map((set, index) => (
          <button
            key={index}
            onClick={() => !set.completed && onSetComplete?.(index)}
            disabled={set.completed}
            className={`${styles.dot} ${set.completed ? styles.completed : styles.incomplete}`}
            aria-label={`Set ${index + 1}: ${set.weight} ${exercise.weightUnit} ${set.completed ? "completed" : "pending"}`}
          >
            {set.completed ? "●" : "○"}
          </button>
        ))}
      </div>
    </div>
  );
};
