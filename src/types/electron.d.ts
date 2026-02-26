/**
 * Type declarations for Electron IPC API exposed to renderer process
 */
import type {
  CreatePersonInput,
  CreateSessionParticipantInput,
  CreateSetInput,
  CreateWorkoutSessionInput,
  UpdatePersonInput,
  UpdateSessionParticipantInput,
  UpdateSetInput,
  UpdateWorkoutSessionInput,
  Person,
  WorkoutSession,
  SessionParticipant,
  Set,
  ParticipantWithSets,
  SessionWithParticipants,
} from "../db/types";

declare global {
  interface Window {
    database: {
      // People
      createPerson: (input: CreatePersonInput) => Promise<Person>;
      getPerson: (id: string) => Promise<Person | null>;
      getAllPeople: () => Promise<Person[]>;
      updatePerson: (
        id: string,
        input: UpdatePersonInput,
      ) => Promise<Person | null>;
      deletePerson: (id: string) => Promise<boolean>;

      // Workout Sessions
      createWorkoutSession: (
        input: CreateWorkoutSessionInput,
      ) => Promise<WorkoutSession>;
      getWorkoutSession: (id: string) => Promise<WorkoutSession | null>;
      getActiveWorkoutSession: () => Promise<WorkoutSession | null>;
      getAllWorkoutSessions: () => Promise<WorkoutSession[]>;
      updateWorkoutSession: (
        id: string,
        input: UpdateWorkoutSessionInput,
      ) => Promise<WorkoutSession | null>;
      endWorkoutSession: (id: string) => Promise<WorkoutSession | null>;
      deleteWorkoutSession: (id: string) => Promise<boolean>;

      // Session Participants
      createSessionParticipant: (
        input: CreateSessionParticipantInput,
      ) => Promise<SessionParticipant>;
      getSessionParticipant: (id: string) => Promise<SessionParticipant | null>;
      getSessionParticipants: (
        sessionId: string,
      ) => Promise<SessionParticipant[]>;
      getActiveSessionParticipants: (
        sessionId: string,
      ) => Promise<SessionParticipant[]>;
      updateSessionParticipant: (
        id: string,
        input: UpdateSessionParticipantInput,
      ) => Promise<SessionParticipant | null>;
      deleteSessionParticipant: (id: string) => Promise<boolean>;

      // Sets
      createSet: (input: CreateSetInput) => Promise<Set>;
      getSet: (id: string) => Promise<Set | null>;
      getSetsByParticipant: (participantId: string) => Promise<Set[]>;
      updateSet: (id: string, input: UpdateSetInput) => Promise<Set | null>;
      completeSet: (id: string) => Promise<Set | null>;
      deleteSet: (id: string) => Promise<boolean>;

      // Joined Queries
      getParticipantWithSets: (
        participantId: string,
      ) => Promise<ParticipantWithSets | null>;
      getSessionWithParticipants: (
        sessionId: string,
      ) => Promise<SessionWithParticipants | null>;
      getActiveSessionWithParticipants: () => Promise<SessionWithParticipants | null>;

      // Seed database for testing
      seedDatabase: () => Promise<void>;
    };
  }
}

export {};