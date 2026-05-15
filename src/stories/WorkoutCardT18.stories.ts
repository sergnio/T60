import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { Exercise } from "./WorkoutCardT18";
import { WorkoutCardT18 } from "./WorkoutCardT18";

// Mock exercise data
const benchPress170: Exercise = {
  name: "Bench Press",
  weightUnit: "lbs",
  sets: [
    { weight: 170, completed: true },
    { weight: 170, completed: true },
    { weight: 170, completed: false },
    { weight: 170, completed: false },
    { weight: 170, completed: false },
  ],
  currentSetIndex: 2,
  barWeight: 45,
};

const meta = {
  title: "Workout/WorkoutCardT18",
  component: WorkoutCardT18,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isActive: {
      control: "boolean",
      description: "Whether this card is currently active (their turn)",
    },
    personName: {
      control: "text",
      description: "Name of the person working out",
    },
  },
  args: {
    onSetComplete: fn(),
  },
} satisfies Meta<typeof WorkoutCardT18>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Active workout card with pulsating orange animation.
 * Shows the new TONY-18 design with split layout:
 * - Left: Name and large weight display
 * - Right: Bar weight and plate breakdown with visual SVGs
 * - Bottom: Set completion dots
 */
export const ActiveWithPlates: Story = {
  args: {
    personName: "TONY",
    exercise: benchPress170,
    isActive: true,
  },
};

// Plate-loaded machine with no bar — all plates stack on one side.
const plateLoaded135: Exercise = {
  name: "Plate-Loaded Machine",
  weightUnit: "lbs",
  sets: [
    { weight: 45, completed: true },
    { weight: 95, completed: false },
    { weight: 135, completed: false },
    { weight: 135, completed: false },
    { weight: 135, completed: false },
  ],
  currentSetIndex: 2,
  barWeight: 0,
};

/**
 * Exercise with bar weight = 0 — plates stack on a single side
 * rather than mirrored across two (TONY-122). 135 lb resolves to
 * three 45 plates on one stack instead of "1×45 per side".
 */
export const SingleSidedNoBar: Story = {
  args: {
    personName: "SERGIO",
    exercise: plateLoaded135,
    isActive: true,
  },
};

// Custom bar weight (e.g. EZ curl bar at 25 lbs)
const ezCurlBar: Exercise = {
  name: "EZ Bar Curl",
  weightUnit: "lbs",
  sets: [
    { weight: 65, completed: false },
    { weight: 75, completed: false },
    { weight: 85, completed: false },
    { weight: 85, completed: false },
    { weight: 85, completed: false },
  ],
  currentSetIndex: 0,
  barWeight: 25,
};

/**
 * Exercise with a custom bar weight (25 lb EZ curl bar).
 * Shows that the plate breakdown correctly accounts for
 * a non-standard bar weight (TONY-99).
 */
export const CustomBarWeight: Story = {
  args: {
    personName: "NOAH",
    exercise: ezCurlBar,
    isActive: false,
  },
};
