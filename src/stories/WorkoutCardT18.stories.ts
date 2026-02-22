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
