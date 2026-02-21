import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "@storybook/test";
import { WorkoutCard } from "./WorkoutCard";
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
  title: "Workout/WorkoutCard",
  component: WorkoutCard,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["active", "resting", "completed"],
      description: "Visual state of the workout card",
    },
    personName: {
      control: "text",
      description: "Name of the person working out",
    },
    restTimeRemaining: {
      control: "number",
      description: "Remaining rest time in seconds",
    },
  },
  args: {
    onSetComplete: fn(),
  },
} satisfies Meta<typeof WorkoutCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Active workout - person is currently exercising with no rest timer.
 * Shows 2 out of 5 sets completed.
 */
export const Active: Story = {
  args: {
    personName: "TONY",
    exercise: benchPress170,
    variant: "active",
  },
};

/**
 * Resting state - person is on a rest timer between sets.
 * Card has animated orange ring and pulsing timer badge.
 */
export const Resting: Story = {
  args: {
    personName: "TONY",
    exercise: benchPress170,
    restTimeRemaining: 150, // 2:30
    variant: "resting",
  },
};

/**
 * Just started - beginning of a workout with no sets completed yet.
 * Fresh and ready to go!
 */
export const JustStarted: Story = {
  args: {
    personName: "SARAH",
    exercise: deadlift265,
    variant: "active",
  },
};

/**
 * Almost done - 4 out of 5 sets completed.
 * One more set to finish strong!
 */
export const AlmostDone: Story = {
  args: {
    personName: "MIKE",
    exercise: row241,
    variant: "active",
  },
};

/**
 * Completed workout - all sets finished!
 * Card shows success state with green gradient background.
 */
export const Completed: Story = {
  args: {
    personName: "ALEX",
    exercise: squat225Completed,
    variant: "completed",
  },
};

/**
 * Heavy weight - showcases large numbers and fewer sets.
 * Powerlifting style workout with 405 lbs deadlifts.
 */
export const HeavyWeight: Story = {
  args: {
    personName: "JAKE",
    exercise: deadlift405,
    variant: "active",
  },
};

/**
 * Variable reps - different rep counts per set.
 * Demonstrates the flexibility of the data model with pyramid training.
 */
export const VariableReps: Story = {
  args: {
    personName: "EMMA",
    exercise: overheadPress95,
    variant: "active",
  },
};

/**
 * Interactive example - click on empty dots to mark sets as complete.
 * Demonstrates the interactive capabilities of the component.
 */
export const Interactive: Story = {
  args: {
    personName: "TONY",
    exercise: benchPress170,
    variant: "active",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the first incomplete set button (should be the third dot)
    const setButtons = canvasElement.querySelectorAll("button");
    const incompleteButtons = Array.from(setButtons).filter(
      (btn) => btn.textContent === "○",
    );

    if (incompleteButtons.length > 0) {
      // Click the first incomplete set
      await userEvent.click(incompleteButtons[0]);

      // Verify the callback was called with the correct index
      await expect(args.onSetComplete).toHaveBeenCalledWith(2);
    }
  },
};

/**
 * Short rest - person resting for less than a minute.
 * Shows timer with seconds countdown.
 */
export const ShortRest: Story = {
  args: {
    personName: "SARAH",
    exercise: deadlift265,
    restTimeRemaining: 45, // 0:45
    variant: "resting",
  },
};
