import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkoutCard3 } from "./WorkoutCard3";

const meta = {
  title: "Workout/WorkoutCard3",
  component: WorkoutCard3,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    personName: {
      control: "text",
      description: "Name of the person working out",
    },
    totalWeight: {
      control: "number",
      description: "Total weight being lifted",
    },
    barWeight: {
      control: "number",
      description: "Weight of the bar",
    },
    weightUnit: {
      control: "select",
      options: ["lbs", "kg"],
      description: "Unit of weight measurement",
    },
    completedSets: {
      control: { type: "range", min: 0, max: 10, step: 1 },
      description: "Number of completed sets",
    },
    totalSets: {
      control: { type: "range", min: 1, max: 10, step: 1 },
      description: "Total number of sets",
    },
    variant: {
      control: "select",
      options: ["active", "resting", "completed"],
      description: "Visual state of the workout card",
    },
  },
  args: {
    onSetClick: fn(),
  },
} satisfies Meta<typeof WorkoutCard3>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Plate loading card showing the exact breakdown of plates needed
 * for a 170 lb bench press with a 45lb bar.
 *
 * Calculation: 170 total - 45 bar = 125 remaining
 * Per side: 125 / 2 = 62.5 lbs
 * Plates per side: 45 + 10 + 5 + 2.5 = 62.5 lbs ✓
 */
export const PlateLoadingBreakdown: Story = {
  args: {
    personName: "Tony",
    exerciseName: "Bench Press",
    totalWeight: 170,
    barWeight: 45,
    weightUnit: "lbs",
    plates: [45, 10, 5, 2.5],
    completedSets: 2,
    totalSets: 5,
    variant: "active",
  },
};
