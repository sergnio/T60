import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MissingMaxWeightsPopup } from "../components/MissingMaxWeightsPopup";
import type { Person } from "../db/types";

// Create a query client for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock people data
const mockPeople: Person[] = [
  {
    id: "person-1",
    name: "Tony",
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  {
    id: "person-2",
    name: "Sergio",
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  {
    id: "person-3",
    name: "Steve",
    created_at: Date.now(),
    updated_at: Date.now(),
  },
];

const meta = {
  title: "Workout/MissingMaxWeightsPopup",
  component: MissingMaxWeightsPopup,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "light",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MissingMaxWeightsPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Single person missing max weights for multiple exercises.
 * Shows a clean list of exercises that need max weights set.
 */
export const SinglePerson: Story = {
  args: {
    missingMaxWeights: [
      { personId: "person-1", exerciseId: "exercise-bench" },
      { personId: "person-1", exerciseId: "exercise-squat" },
      { personId: "person-1", exerciseId: "exercise-deadlift" },
    ],
    people: mockPeople,
    onClose: () => console.log("Popup closed"),
    onCancel: () => console.log("Popup cancelled"),
  },
};

/**
 * Multiple people missing max weights for different exercises.
 * This is the most common scenario when starting a new workout.
 */
export const MultiplePeople: Story = {
  args: {
    missingMaxWeights: [
      { personId: "person-1", exerciseId: "exercise-bench" },
      { personId: "person-1", exerciseId: "exercise-squat" },
      { personId: "person-2", exerciseId: "exercise-bench" },
      { personId: "person-2", exerciseId: "exercise-deadlift" },
      { personId: "person-3", exerciseId: "exercise-squat" },
    ],
    people: mockPeople,
    onClose: () => console.log("Popup closed"),
    onCancel: () => console.log("Popup cancelled"),
  },
};

/**
 * Single person missing max weight for just one exercise.
 * Minimal case that shows the popup still looks good with minimal content.
 */
export const MinimalCase: Story = {
  args: {
    missingMaxWeights: [{ personId: "person-1", exerciseId: "exercise-bench" }],
    people: mockPeople,
    onClose: () => console.log("Popup closed"),
    onCancel: () => console.log("Popup cancelled"),
  },
};

/**
 * Many people missing max weights.
 * Tests the scrolling behavior when there are many missing max weights.
 */
export const ManyPeople: Story = {
  args: {
    missingMaxWeights: [
      { personId: "person-1", exerciseId: "exercise-bench" },
      { personId: "person-1", exerciseId: "exercise-squat" },
      { personId: "person-1", exerciseId: "exercise-deadlift" },
      { personId: "person-2", exerciseId: "exercise-bench" },
      { personId: "person-2", exerciseId: "exercise-squat" },
      { personId: "person-2", exerciseId: "exercise-deadlift" },
      { personId: "person-3", exerciseId: "exercise-bench" },
      { personId: "person-3", exerciseId: "exercise-squat" },
      { personId: "person-3", exerciseId: "exercise-deadlift" },
    ],
    people: mockPeople,
    onClose: () => console.log("Popup closed"),
    onCancel: () => console.log("Popup cancelled"),
  },
};
