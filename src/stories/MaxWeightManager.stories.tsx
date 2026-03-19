import type { Meta, StoryObj } from "@storybook/react";
import { MaxWeightManager } from "../components/MaxWeightManager.tsx";

const meta = {
  title: "Components/MaxWeightManager",
  component: MaxWeightManager,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MaxWeightManager>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view of the Max Weight Manager
 * - Click on a person in the left panel to see their max weights
 * - Each exercise shows the current max weight (if set)
 * - Click "Set" or "Edit" to modify max weights
 */
export const Default: Story = {};