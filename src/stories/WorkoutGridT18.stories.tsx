import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { Exercise } from "./WorkoutCardT18";
import { WorkoutCardT18 } from "./WorkoutCardT18";

// Sample workout data - exact scenario from App.tsx
const tonyBench: Exercise = {
  name: "Bench Press",
  weightUnit: "lbs",
  sets: [
    { weight: 170, completed: true },
    { weight: 250, completed: true },
    { weight: 210, completed: false },
    { weight: 230, completed: false },
    { weight: 250, completed: false },
  ],
  currentSetIndex: 1,
  barWeight: 45,
};

const sergioBench: Exercise = {
  name: "Bench Press",
  weightUnit: "lbs",
  sets: [
    { weight: 170, completed: true },
    { weight: 95, completed: true },
    { weight: 210, completed: false },
    { weight: 230, completed: false },
    { weight: 250, completed: false },
  ],
  currentSetIndex: 1,
  barWeight: 45,
};

const steveDeadlift: Exercise = {
  name: "Deadlift",
  weightUnit: "lbs",
  sets: [
    { weight: 265, completed: true },
    { weight: 155, completed: true },
    { weight: 305, completed: false },
    { weight: 305, completed: false },
    { weight: 325, completed: false },
  ],
  currentSetIndex: 1,
  barWeight: 45,
};

const noahDeadlift: Exercise = {
  name: "Deadlift",
  weightUnit: "lbs",
  sets: [
    { weight: 265, completed: true },
    { weight: 210, completed: true },
    { weight: 305, completed: false },
    { weight: 325, completed: false },
    { weight: 325, completed: false },
  ],
  currentSetIndex: 1,
  barWeight: 45,
};

const maviSquat: Exercise = {
  name: "Back Squat",
  weightUnit: "lbs",
  sets: [
    { weight: 185, completed: true },
    { weight: 245, completed: true },
    { weight: 315, completed: false },
    { weight: 365, completed: false },
    { weight: 365, completed: false },
  ],
  currentSetIndex: 1,
  barWeight: 45,
};

const kakesSquat: Exercise = {
  name: "Back Squat",
  weightUnit: "lbs",
  sets: [
    { weight: 185, completed: true },
    { weight: 300, completed: true },
    { weight: 315, completed: false },
    { weight: 365, completed: false },
    { weight: 365, completed: false },
  ],
  currentSetIndex: 1,
  barWeight: 45,
};

/**
 * Grid component showing full workout session
 */
const WorkoutGridT18 = ({
  onSetComplete,
}: {
  onSetComplete: (personName: string, setIndex: number) => void;
}) => (
  <div className="flex flex-col gap-10 w-screen h-screen bg-gray-50 dark:bg-gray-900 p-10 items-center justify-center">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-[90vw]">
      {/* Active Users - Top 3 */}
      <div className="flex flex-col gap-3">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">
          {tonyBench.name}
        </div>
        <WorkoutCardT18
          personName="TONY"
          exercise={tonyBench}
          isActive
          onSetComplete={(index) => onSetComplete("TONY", index)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">
          {steveDeadlift.name}
        </div>
        <WorkoutCardT18
          personName="STEPHEN"
          exercise={steveDeadlift}
          isActive
          onSetComplete={(index) => onSetComplete("STEPHEN", index)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">
          {maviSquat.name}
        </div>
        <WorkoutCardT18
          personName="VICTORIA"
          exercise={maviSquat}
          isActive
          onSetComplete={(index) => onSetComplete("VICTORIA", index)}
        />
      </div>

      {/* Resting Users - Bottom 3 */}
      <WorkoutCardT18
        personName="SERGIO"
        exercise={sergioBench}
        isActive={false}
        onSetComplete={(index) => onSetComplete("SERGIO", index)}
      />
      <WorkoutCardT18
        personName="NOAH"
        exercise={noahDeadlift}
        isActive={false}
        onSetComplete={(index) => onSetComplete("NOAH", index)}
      />
      <WorkoutCardT18
        personName="KAKES"
        exercise={kakesSquat}
        isActive={false}
        onSetComplete={(index) => onSetComplete("KAKES", index)}
      />
    </div>
  </div>
);

const meta = {
  title: "Workout/WorkoutGridT18",
  component: WorkoutGridT18,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "light",
    },
  },
  tags: ["autodocs"],
  args: {
    onSetComplete: fn(),
  },
} satisfies Meta<typeof WorkoutGridT18>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Full workout session grid showing 6 participants.
 * Top 3 are active (pulsating orange), bottom 3 are resting.
 * This preserves the exact scenario from the original App.tsx.
 */
export const FullSessionGrid: Story = {
  args: {},
};
