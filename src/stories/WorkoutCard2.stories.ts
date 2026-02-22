import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Exercise2 } from "./WorkoutCard2";
import { WorkoutCard2 } from "./WorkoutCard2";

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
    { reps: 12, completed: true, perSide: true, note: "each side" },
    { reps: 12, completed: true, perSide: true, note: "each side" },
    { reps: 12, completed: false, perSide: true, note: "each side" },
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

const deadlift315Completed: Exercise2 = {
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

const meta = {
  title: "Workout/WorkoutCard2",
  component: WorkoutCard2,
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
    showTotalWeight: {
      control: "boolean",
      description: "Show total weight lifted",
    },
  },
  args: {
    onSetComplete: fn(),
  },
} satisfies Meta<typeof WorkoutCard2>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Active with timer - person is currently exercising with a countdown timer.
 * Large central timer display in amber/orange gradient.
 * Shows session info "L30xL, 1st set" at the top.
 */
export const ActiveWithTimer: Story = {
  args: {
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
};

/**
 * Resting - person is on a rest timer between sets.
 * Card has orange border to indicate resting state.
 * Shows rest time prominently in the center.
 */
export const Resting: Story = {
  args: {
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
      currentSet: "Set 2 of 5",
    },
    variant: "resting",
    showTotalWeight: true,
  },
};

/**
 * Reps display - focuses on target reps for the current set.
 * Large central number showing the rep count.
 * Useful for exercises where reps are the primary metric.
 */
export const RepsDisplay: Story = {
  args: {
    personName: "Steve",
    exercise: squat225,
    displayMetric: {
      type: "reps",
      value: 10,
      label: "Target reps",
      color: "indigo",
    },
    sessionInfo: {
      format: "4x10",
      currentSet: "Set 3 of 4",
    },
    variant: "active",
    showTotalWeight: true,
  },
};

/**
 * Per-side exercise - unilateral exercise with "each side" notation.
 * Shows dumbbell curls with per-side tracking.
 * Each set displays "12 each side" instead of just "12 reps".
 */
export const PerSideExercise: Story = {
  args: {
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
};

/**
 * Completed workout - all sets finished!
 * Card shows success state with green gradient background.
 * Total weight is displayed prominently with dumbbell icon.
 */
export const Completed: Story = {
  args: {
    personName: "Victoria",
    exercise: deadlift315Completed,
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
};

/**
 * Minimal - no session info or total weight display.
 * Simplest possible configuration for a clean, focused view.
 * Just the essentials: name, exercise, metric, and progress.
 */
export const Minimal: Story = {
  args: {
    personName: "Noah",
    exercise: lateralRaise35,
    displayMetric: {
      type: "reps",
      value: 15,
      label: "Target reps",
      color: "indigo",
    },
    variant: "active",
    showTotalWeight: false,
  },
};

/**
 * Dark mode - showcases the dark mode styling.
 * All colors and gradients adapt beautifully to dark backgrounds.
 */
export const DarkMode: Story = {
  args: {
    personName: "Sergio",
    exercise: benchPress175,
    displayMetric: {
      type: "timer",
      value: 45,
      label: "Time remaining",
      color: "amber",
    },
    sessionInfo: {
      format: "L30xL",
      currentSet: "2nd set",
    },
    variant: "active",
    showTotalWeight: true,
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

/**
 * Interactive example - click on empty dots to mark sets as complete.
 * Demonstrates the interactive capabilities of the component.
 */
export const Interactive: Story = {
  args: {
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the first incomplete set button
    const setButtons = canvasElement.querySelectorAll("button");
    const incompleteButtons = Array.from(setButtons).filter(
      (btn) => btn.textContent === "○",
    );

    if (incompleteButtons.length > 0) {
      // Click the first incomplete set
      await userEvent.click(incompleteButtons[0]);

      // Verify the callback was called with the correct index
      await expect(args.onSetComplete).toHaveBeenCalledWith(1);
    }
  },
};
