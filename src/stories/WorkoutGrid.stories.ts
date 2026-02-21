import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkoutGrid } from "./WorkoutGrid";
import type { Exercise } from "./WorkoutCard";

// Mock exercise data
const benchPress170: Exercise = {
  name: "Bench Press",
  weight: 170,
  weightUnit: "lbs",
  sets: [
    { reps: 10, completed: true },
    { reps: 10, completed: true },
    { reps: 10, completed: false },
    { reps: 10, completed: false },
    { reps: 10, completed: false },
  ],
  currentSetIndex: 2,
};

const deadlift265: Exercise = {
  name: "Deadlift",
  weight: 265,
  weightUnit: "lbs",
  sets: [
    { reps: 8, completed: false },
    { reps: 8, completed: false },
    { reps: 8, completed: false },
    { reps: 8, completed: false },
    { reps: 8, completed: false },
  ],
  currentSetIndex: 0,
};

const row241: Exercise = {
  name: "Barbell Row",
  weight: 241,
  weightUnit: "lbs",
  sets: [
    { reps: 12, completed: true },
    { reps: 12, completed: true },
    { reps: 12, completed: true },
    { reps: 12, completed: true },
    { reps: 12, completed: false },
  ],
  currentSetIndex: 4,
};

const squat225Completed: Exercise = {
  name: "Squat",
  weight: 225,
  weightUnit: "lbs",
  sets: [
    { reps: 10, completed: true },
    { reps: 10, completed: true },
    { reps: 10, completed: true },
    { reps: 10, completed: true },
    { reps: 10, completed: true },
  ],
  currentSetIndex: 5,
};

const deadlift405: Exercise = {
  name: "Deadlift",
  weight: 405,
  weightUnit: "lbs",
  sets: [
    { reps: 5, completed: true },
    { reps: 5, completed: false },
    { reps: 5, completed: false },
  ],
  currentSetIndex: 1,
};

const overheadPress95: Exercise = {
  name: "Overhead Press",
  weight: 95,
  weightUnit: "lbs",
  sets: [
    { reps: 5, completed: true },
    { reps: 10, completed: true },
    { reps: 5, completed: false },
    { reps: 2, completed: false },
  ],
  currentSetIndex: 2,
};

const meta = {
  title: "Workout/WorkoutGrid",
  component: WorkoutGrid,
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
} satisfies Meta<typeof WorkoutGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Six people working out - the main dashboard view.
 * Shows a mix of active, resting, and completed states in a 3-column grid.
 * This is the typical real-world scenario for a gym workout tracker.
 */
export const SixPeople: Story = {
  args: {
    workouts: [
      {
        personName: "TONY",
        exercise: benchPress170,
        restTimeRemaining: 150,
        variant: "resting",
      },
      {
        personName: "NOAH",
        exercise: deadlift265,
        variant: "active",
      },
      {
        personName: "KAKES",
        exercise: row241,
        variant: "active",
      },
      {
        personName: "STEVEN",
        exercise: squat225Completed,
        variant: "completed",
      },
      {
        personName: "VICTORIA",
        exercise: overheadPress95,
        restTimeRemaining: 45,
        variant: "resting",
      },
      {
        personName: "MARSHA",
        exercise: deadlift405,
        variant: "active",
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
        personName: "TONY",
        exercise: benchPress170,
        restTimeRemaining: 150,
        variant: "resting",
      },
      {
        personName: "SARAH",
        exercise: deadlift265,
        variant: "active",
      },
      {
        personName: "MIKE",
        exercise: row241,
        variant: "active",
      },
      {
        personName: "ALEX",
        exercise: squat225Completed,
        variant: "completed",
      },
      {
        personName: "EMMA",
        exercise: overheadPress95,
        restTimeRemaining: 45,
        variant: "resting",
      },
      {
        personName: "JAKE",
        exercise: deadlift405,
        variant: "active",
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
        personName: "TONY",
        exercise: benchPress170,
        restTimeRemaining: 150,
        variant: "resting",
      },
      {
        personName: "SARAH",
        exercise: deadlift265,
        variant: "active",
      },
      {
        personName: "ALEX",
        exercise: squat225Completed,
        variant: "completed",
      },
    ],
    columns: 1,
  },
};

/**
 * Small group - two people working out together.
 * A common scenario for workout buddies or personal training sessions.
 */
export const SmallGroup: Story = {
  args: {
    workouts: [
      {
        personName: "TONY",
        exercise: benchPress170,
        variant: "active",
      },
      {
        personName: "SARAH",
        exercise: deadlift265,
        restTimeRemaining: 90,
        variant: "resting",
      },
    ],
    columns: 2,
  },
};

/**
 * All resting - everyone is on a rest timer.
 * Shows how the dashboard looks when multiple people are resting
 * with the animated orange rings and pulsing timers.
 */
export const AllResting: Story = {
  args: {
    workouts: [
      {
        personName: "TONY",
        exercise: benchPress170,
        restTimeRemaining: 150,
        variant: "resting",
      },
      {
        personName: "SARAH",
        exercise: deadlift265,
        restTimeRemaining: 120,
        variant: "resting",
      },
      {
        personName: "MIKE",
        exercise: row241,
        restTimeRemaining: 90,
        variant: "resting",
      },
      {
        personName: "EMMA",
        exercise: overheadPress95,
        restTimeRemaining: 45,
        variant: "resting",
      },
    ],
    columns: 2,
  },
};

/**
 * Mixed progress - people at different stages of their workouts.
 * Realistic scenario showing beginners, mid-workout, and finished states.
 */
export const MixedProgress: Story = {
  args: {
    workouts: [
      {
        personName: "BEGINNER",
        exercise: deadlift265,
        variant: "active",
      },
      {
        personName: "HALFWAY",
        exercise: benchPress170,
        variant: "active",
      },
      {
        personName: "ALMOST DONE",
        exercise: row241,
        restTimeRemaining: 60,
        variant: "resting",
      },
      {
        personName: "FINISHED",
        exercise: squat225Completed,
        variant: "completed",
      },
    ],
    columns: 2,
  },
};
