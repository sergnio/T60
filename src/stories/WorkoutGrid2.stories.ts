import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkoutGrid2 } from "./WorkoutGrid2";
import type { Exercise2 } from "./WorkoutCard2";

// Mock exercise data for WorkoutCard2
const benchPress175: Exercise2 = {
  name: "Bench Press",
  weight: 175,
  weightUnit: "lbs",
  sets: [
    { reps: 45, completed: true, perSide: true },
    { reps: 45, completed: false, perSide: true },
    { reps: 45, completed: false, perSide: true },
    { reps: 45, completed: false, perSide: true },
  ],
  currentSetIndex: 1,
};

const dumbbellCurl50: Exercise2 = {
  name: "Dumbbell Curl",
  weight: 50,
  weightUnit: "lbs",
  sets: [
    { reps: 12, completed: true, perSide: true },
    { reps: 12, completed: true, perSide: true },
    { reps: 12, completed: false, perSide: true },
  ],
  currentSetIndex: 2,
};

const squat225: Exercise2 = {
  name: "Squat",
  weight: 225,
  weightUnit: "lbs",
  sets: [
    { reps: 10, completed: true },
    { reps: 10, completed: true },
    { reps: 10, completed: false },
    { reps: 10, completed: false },
  ],
  currentSetIndex: 2,
};

const deadlift315: Exercise2 = {
  name: "Deadlift",
  weight: 315,
  weightUnit: "lbs",
  sets: [
    { reps: 5, completed: true },
    { reps: 5, completed: true },
    { reps: 5, completed: true },
    { reps: 5, completed: true },
  ],
  currentSetIndex: 4,
};

const lateralRaise35: Exercise2 = {
  name: "Lateral Raise",
  weight: 35,
  weightUnit: "lbs",
  sets: [
    { reps: 15, completed: false, perSide: true },
    { reps: 15, completed: false, perSide: true },
    { reps: 15, completed: false, perSide: true },
  ],
  currentSetIndex: 0,
};

const overheadPress135: Exercise2 = {
  name: "Overhead Press",
  weight: 135,
  weightUnit: "lbs",
  sets: [
    { reps: 8, completed: true },
    { reps: 8, completed: true },
    { reps: 8, completed: false },
    { reps: 8, completed: false },
    { reps: 8, completed: false },
  ],
  currentSetIndex: 2,
};

const row185: Exercise2 = {
  name: "Barbell Row",
  weight: 185,
  weightUnit: "lbs",
  sets: [
    { reps: 12, completed: true },
    { reps: 12, completed: false },
    { reps: 12, completed: false },
  ],
  currentSetIndex: 1,
};

const meta = {
  title: "Workout/WorkoutGrid2",
  component: WorkoutGrid2,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: "select",
      options: [1, 2, 3],
      description: "Number of columns in the grid",
    },
  },
} satisfies Meta<typeof WorkoutGrid2>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Six people working out - the main dashboard view with WorkoutCard2.
 * Shows a mix of active, resting, and completed states in a 3-column grid.
 * Features the cleaner WorkoutCard2 design with large central metrics,
 * session info, and total weight displays.
 */
export const SixPeople: Story = {
  args: {
    workouts: [
      {
        personName: "Payson",
        exercise: benchPress175,
        displayMetric: {
          type: "timer",
          value: 28,
          label: "Time remaining",
          color: "amber",
        },
        sessionInfo: {
          format: "L30xL",
          currentSet: "1st set",
        },
        variant: "active",
        showTotalWeight: true,
      },
      {
        personName: "Tony",
        exercise: squat225,
        displayMetric: {
          type: "timer",
          value: 90,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "5x5",
          currentSet: "Set 2 of 4",
        },
        variant: "resting",
        showTotalWeight: true,
      },
      {
        personName: "Steve",
        exercise: overheadPress135,
        displayMetric: {
          type: "reps",
          value: 8,
          label: "Target reps",
          color: "indigo",
        },
        sessionInfo: {
          format: "5x8",
          currentSet: "Set 3 of 5",
        },
        variant: "active",
        showTotalWeight: true,
      },
      {
        personName: "Victoria",
        exercise: deadlift315,
        displayMetric: {
          type: "custom",
          value: 6300,
          label: "Total weight",
          color: "green",
        },
        sessionInfo: {
          format: "4x5",
          currentSet: "Complete!",
        },
        variant: "completed",
        showTotalWeight: true,
      },
      {
        personName: "Kakes",
        exercise: dumbbellCurl50,
        displayMetric: {
          type: "reps",
          value: 12,
          label: "Each side",
          color: "indigo",
        },
        sessionInfo: {
          format: "3x12",
          currentSet: "Set 3 of 3",
        },
        variant: "active",
        showTotalWeight: true,
      },
      {
        personName: "Noah",
        exercise: lateralRaise35,
        displayMetric: {
          type: "timer",
          value: 45,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "3x15",
          currentSet: "Set 1 of 3",
        },
        variant: "resting",
        showTotalWeight: false,
      },
    ],
    columns: 3,
  },
};

/**
 * Two column layout - alternative view for narrower displays.
 * Same six people, but arranged in 2 columns for better readability
 * on tablets or when you want a more focused view.
 */
export const TwoColumns: Story = {
  args: {
    workouts: [
      {
        personName: "Payson",
        exercise: benchPress175,
        displayMetric: {
          type: "timer",
          value: 28,
          label: "Time remaining",
          color: "amber",
        },
        sessionInfo: {
          format: "L30xL",
          currentSet: "1st set",
        },
        variant: "active",
        showTotalWeight: true,
      },
      {
        personName: "Tony",
        exercise: squat225,
        displayMetric: {
          type: "timer",
          value: 90,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "5x5",
          currentSet: "Set 2 of 4",
        },
        variant: "resting",
        showTotalWeight: true,
      },
      {
        personName: "Steve",
        exercise: overheadPress135,
        displayMetric: {
          type: "reps",
          value: 8,
          label: "Target reps",
          color: "indigo",
        },
        sessionInfo: {
          format: "5x8",
          currentSet: "Set 3 of 5",
        },
        variant: "active",
        showTotalWeight: true,
      },
      {
        personName: "Victoria",
        exercise: deadlift315,
        displayMetric: {
          type: "custom",
          value: 6300,
          label: "Total weight",
          color: "green",
        },
        sessionInfo: {
          format: "4x5",
          currentSet: "Complete!",
        },
        variant: "completed",
        showTotalWeight: true,
      },
      {
        personName: "Kakes",
        exercise: dumbbellCurl50,
        displayMetric: {
          type: "reps",
          value: 12,
          label: "Each side",
          color: "indigo",
        },
        sessionInfo: {
          format: "3x12",
          currentSet: "Set 3 of 3",
        },
        variant: "active",
        showTotalWeight: true,
      },
      {
        personName: "Noah",
        exercise: lateralRaise35,
        displayMetric: {
          type: "timer",
          value: 45,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "3x15",
          currentSet: "Set 1 of 3",
        },
        variant: "resting",
        showTotalWeight: false,
      },
    ],
    columns: 2,
  },
};

/**
 * Single column layout - optimal for mobile devices or detailed viewing.
 * Shows three people in a focused, single-column layout.
 * Perfect for mobile phones or when you want to focus on fewer people.
 */
export const SingleColumn: Story = {
  args: {
    workouts: [
      {
        personName: "Payson",
        exercise: benchPress175,
        displayMetric: {
          type: "timer",
          value: 28,
          label: "Time remaining",
          color: "amber",
        },
        sessionInfo: {
          format: "L30xL",
          currentSet: "1st set",
        },
        variant: "active",
        showTotalWeight: true,
      },
      {
        personName: "Tony",
        exercise: squat225,
        displayMetric: {
          type: "timer",
          value: 90,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "5x5",
          currentSet: "Set 2 of 4",
        },
        variant: "resting",
        showTotalWeight: true,
      },
      {
        personName: "Victoria",
        exercise: deadlift315,
        displayMetric: {
          type: "custom",
          value: 6300,
          label: "Total weight",
          color: "green",
        },
        sessionInfo: {
          format: "4x5",
          currentSet: "Complete!",
        },
        variant: "completed",
        showTotalWeight: true,
      },
    ],
    columns: 1,
  },
};

/**
 * All resting - everyone is on a rest timer.
 * Shows how the dashboard looks when multiple people are resting
 * with the orange bordered cards and prominent rest timers.
 */
export const AllResting: Story = {
  args: {
    workouts: [
      {
        personName: "Payson",
        exercise: benchPress175,
        displayMetric: {
          type: "timer",
          value: 120,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "L30xL",
          currentSet: "Set 2 of 4",
        },
        variant: "resting",
        showTotalWeight: true,
      },
      {
        personName: "Tony",
        exercise: squat225,
        displayMetric: {
          type: "timer",
          value: 90,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "5x5",
          currentSet: "Set 3 of 4",
        },
        variant: "resting",
        showTotalWeight: true,
      },
      {
        personName: "Steve",
        exercise: overheadPress135,
        displayMetric: {
          type: "timer",
          value: 60,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "5x8",
          currentSet: "Set 4 of 5",
        },
        variant: "resting",
        showTotalWeight: true,
      },
      {
        personName: "Kakes",
        exercise: row185,
        displayMetric: {
          type: "timer",
          value: 45,
          label: "Rest time",
          color: "amber",
        },
        sessionInfo: {
          format: "3x12",
          currentSet: "Set 2 of 3",
        },
        variant: "resting",
        showTotalWeight: false,
      },
    ],
    columns: 2,
  },
};
