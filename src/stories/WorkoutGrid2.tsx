import { WorkoutCard2, type WorkoutCard2Props } from "./WorkoutCard2";

/**
 * Props for the WorkoutGrid2 component
 */
export interface WorkoutGrid2Props {
  /** Array of workout data for multiple people */
  workouts: Array<Omit<WorkoutCard2Props, "onSetComplete">>;
  /** Number of columns in the grid layout */
  columns?: 1 | 2 | 3;
}

/**
 * A responsive grid container for displaying multiple WorkoutCard2 components.
 *
 * Features:
 * - Responsive layout that adapts to screen size
 * - Configurable column count (1, 2, or 3)
 * - Subtle gradient background
 * - Optimal spacing and padding
 * - Dark mode support
 *
 * Perfect for displaying a real-time workout dashboard with multiple people
 * using the cleaner WorkoutCard2 design.
 */
export const WorkoutGrid2 = ({ workouts, columns = 3 }: WorkoutGrid2Props) => {
  // Map columns to Tailwind grid classes
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div
      className={`grid ${gridClass} gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen`}
    >
      {workouts.map((workout, idx) => (
        <WorkoutCard2 key={idx} {...workout} />
      ))}
    </div>
  );
};
