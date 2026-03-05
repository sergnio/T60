import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkoutTimer } from "../components/WorkoutTimer";
import type { ParticipantWithSets } from "../db/types";

// Mock participant data
const createMockParticipant = (
  name: string,
  exerciseName: string,
  isActive: boolean,
  completedSets: number,
): ParticipantWithSets => ({
  id: `participant-${name.toLowerCase()}`,
  session_id: "session-1",
  person_id: `person-${name.toLowerCase()}`,
  exercise_name: exerciseName,
  exercise_id: `exercise-${exerciseName.toLowerCase().replace(" ", "-")}`,
  weight_unit: "lbs",
  current_set_index: completedSets,
  is_active: isActive,
  created_at: Date.now(),
  updated_at: Date.now(),
  person: {
    id: `person-${name.toLowerCase()}`,
    name: name,
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  sets: [
    {
      id: `set-${name}-1`,
      participant_id: `participant-${name.toLowerCase()}`,
      set_index: 0,
      weight: 135,
      reps: 5,
      completed: completedSets > 0,
      completed_at: completedSets > 0 ? Date.now() : null,
      created_at: Date.now(),
      updated_at: Date.now(),
    },
    {
      id: `set-${name}-2`,
      participant_id: `participant-${name.toLowerCase()}`,
      set_index: 1,
      weight: 185,
      reps: 5,
      completed: completedSets > 1,
      completed_at: completedSets > 1 ? Date.now() : null,
      created_at: Date.now(),
      updated_at: Date.now(),
    },
    {
      id: `set-${name}-3`,
      participant_id: `participant-${name.toLowerCase()}`,
      set_index: 2,
      weight: 225,
      reps: 5,
      completed: completedSets > 2,
      completed_at: completedSets > 2 ? Date.now() : null,
      created_at: Date.now(),
      updated_at: Date.now(),
    },
    {
      id: `set-${name}-4`,
      participant_id: `participant-${name.toLowerCase()}`,
      set_index: 3,
      weight: 245,
      reps: 5,
      completed: completedSets > 3,
      completed_at: completedSets > 3 ? Date.now() : null,
      created_at: Date.now(),
      updated_at: Date.now(),
    },
    {
      id: `set-${name}-5`,
      participant_id: `participant-${name.toLowerCase()}`,
      set_index: 4,
      weight: 265,
      reps: 5,
      completed: completedSets > 4,
      completed_at: completedSets > 4 ? Date.now() : null,
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  ],
});

// Active workout - 6 participants, 3 active, 3 resting, early in workout
const activeWorkoutParticipants: ParticipantWithSets[] = [
  createMockParticipant("Tony", "Bench Press", true, 2),
  createMockParticipant("Steve", "Deadlift", true, 2),
  createMockParticipant("Victoria", "Back Squat", true, 2),
  createMockParticipant("Sergio", "Bench Press", false, 2),
  createMockParticipant("Noah", "Deadlift", false, 2),
  createMockParticipant("Kakes", "Back Squat", false, 2),
];

// Just started - nobody has completed sets yet
const justStartedParticipants: ParticipantWithSets[] = [
  createMockParticipant("Tony", "Bench Press", true, 0),
  createMockParticipant("Steve", "Deadlift", true, 0),
  createMockParticipant("Victoria", "Back Squat", true, 0),
  createMockParticipant("Sergio", "Bench Press", false, 0),
  createMockParticipant("Noah", "Deadlift", false, 0),
  createMockParticipant("Kakes", "Back Squat", false, 0),
];

// Almost complete - 4/5 sets done
const almostCompleteParticipants: ParticipantWithSets[] = [
  createMockParticipant("Tony", "Bench Press", true, 4),
  createMockParticipant("Steve", "Deadlift", true, 4),
  createMockParticipant("Victoria", "Back Squat", true, 4),
  createMockParticipant("Sergio", "Bench Press", false, 4),
  createMockParticipant("Noah", "Deadlift", false, 4),
  createMockParticipant("Kakes", "Back Squat", false, 4),
];

// Completed - all sets done
const completedParticipants: ParticipantWithSets[] = [
  createMockParticipant("Tony", "Bench Press", true, 5),
  createMockParticipant("Steve", "Deadlift", true, 5),
  createMockParticipant("Victoria", "Back Squat", true, 5),
  createMockParticipant("Sergio", "Bench Press", false, 5),
  createMockParticipant("Noah", "Deadlift", false, 5),
  createMockParticipant("Kakes", "Back Squat", false, 5),
];

// Small group - 2 participants
const smallGroupParticipants: ParticipantWithSets[] = [
  createMockParticipant("Tony", "Bench Press", true, 1),
  createMockParticipant("Sergio", "Bench Press", false, 1),
];

// Solo participant
const soloParticipant: ParticipantWithSets[] = [
  createMockParticipant("Tony", "Bench Press", true, 2),
];

const meta = {
  title: "Workout/WorkoutTimer",
  component: WorkoutTimer,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WorkoutTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Active workout with 6 participants (3 active, 3 resting).
 * Timer will count down and rotate participants when it hits 0:00.
 */
export const ActiveWorkout: Story = {
  args: {
    participants: activeWorkoutParticipants,
  },
};

/**
 * Workout that just started - no sets completed yet.
 * Shows initial state with timer at 1:30.
 */
export const JustStarted: Story = {
  args: {
    participants: justStartedParticipants,
  },
};

/**
 * Workout almost complete - 4 out of 5 sets done.
 * One more rotation and the workout will be complete.
 */
export const AlmostComplete: Story = {
  args: {
    participants: almostCompleteParticipants,
  },
};

/**
 * Completed workout - all participants have finished all sets.
 * Timer should be stopped and show "Workout Complete!" message.
 */
export const Completed: Story = {
  args: {
    participants: completedParticipants,
  },
};

/**
 * Small group with just 2 participants.
 * Shows timer working with minimal participant count.
 */
export const SmallGroup: Story = {
  args: {
    participants: smallGroupParticipants,
  },
};

/**
 * Solo participant working out alone.
 * Timer still functions, toggling their active state each period.
 */
export const SoloWorkout: Story = {
  args: {
    participants: soloParticipant,
  },
};
