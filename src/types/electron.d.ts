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
import type { ServiceResult } from "../services/types/serviceResults";

declare global {
  interface Window {
    database: {
      // People
      createPerson: (input: CreatePersonInput) => Promise<ServiceResult<Person>>;
      getPerson: (id: string) => Promise<ServiceResult<Person | null>>;
      getAllPeople: () => Promise<ServiceResult<Person[]>>;
      updatePerson: (
        id: string,
        input: UpdatePersonInput,
      ) => Promise<ServiceResult<Person | null>>;
      deletePerson: (id: string) => Promise<ServiceResult<boolean>>;

      // Workout Sessions
      createWorkoutSession: (
        input: CreateWorkoutSessionInput,
      ) => Promise<ServiceResult<WorkoutSession>>;
      getWorkoutSession: (id: string) => Promise<ServiceResult<WorkoutSession | null>>;
      getActiveWorkoutSession: () => Promise<ServiceResult<WorkoutSession | null>>;
      getAllWorkoutSessions: () => Promise<ServiceResult<WorkoutSession[]>>;
      updateWorkoutSession: (
        id: string,
        input: UpdateWorkoutSessionInput,
      ) => Promise<ServiceResult<WorkoutSession | null>>;
      endWorkoutSession: (id: string) => Promise<ServiceResult<WorkoutSession | null>>;
      deleteWorkoutSession: (id: string) => Promise<ServiceResult<boolean>>;

      // Session Participants
      createSessionParticipant: (
        input: CreateSessionParticipantInput,
      ) => Promise<ServiceResult<SessionParticipant>>;
      getSessionParticipant: (id: string) => Promise<ServiceResult<SessionParticipant | null>>;
      getSessionParticipants: (
        sessionId: string,
      ) => Promise<ServiceResult<SessionParticipant[]>>;
      getActiveSessionParticipants: (
        sessionId: string,
      ) => Promise<ServiceResult<SessionParticipant[]>>;
      updateSessionParticipant: (
        id: string,
        input: UpdateSessionParticipantInput,
      ) => Promise<ServiceResult<SessionParticipant | null>>;
      deleteSessionParticipant: (id: string) => Promise<ServiceResult<boolean>>;

      // Sets
      createSet: (input: CreateSetInput) => Promise<ServiceResult<Set>>;
      getSet: (id: string) => Promise<ServiceResult<Set | null>>;
      getSetsByParticipant: (participantId: string) => Promise<ServiceResult<Set[]>>;
      updateSet: (id: string, input: UpdateSetInput) => Promise<ServiceResult<Set | null>>;
      completeSet: (id: string) => Promise<ServiceResult<Set | null>>;
      deleteSet: (id: string) => Promise<ServiceResult<boolean>>;

      // Joined Queries
      getParticipantWithSets: (
        participantId: string,
      ) => Promise<ServiceResult<ParticipantWithSets | null>>;
      getSessionWithParticipants: (
        sessionId: string,
      ) => Promise<ServiceResult<SessionWithParticipants | null>>;
      getActiveSessionWithParticipants: () => Promise<ServiceResult<SessionWithParticipants | null>>;

      // Seed database for testing
      seedDatabase: () => Promise<void>;
    };
  }
}

export {};