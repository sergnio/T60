/**
 * Type declarations for Electron IPC API exposed to renderer process
 */
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
  CreatePersonInput,
  CreateRotationSessionInput,
  CreateSessionParticipantInput,
  CreateSetInput,
  CreateWorkoutSessionInput,
  UpdatePersonInput,
  UpdateSessionParticipantInput,
  UpdateSetInput,
  UpdateWorkoutSessionInput,
  WeightUnit,
  Exercise,
  Person,
  PersonMaxWeight,
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
      // Exercises
      createExercise: (input: CreateExerciseInput) => Promise<ServiceResult<Exercise>>;
      updateExercise: (id: string, input: UpdateExerciseInput) => Promise<ServiceResult<Exercise | null>>;
      getAllExercises: () => Promise<ServiceResult<Exercise[]>>;

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

      // Person Max Weights
      setPersonMaxWeight: (
        personId: string,
        exerciseId: string,
        maxWeight: number,
        weightUnit: WeightUnit,
      ) => Promise<ServiceResult<PersonMaxWeight>>;
      getPersonMaxWeights: (personId: string) => Promise<ServiceResult<PersonMaxWeight[]>>;
      getPersonMaxWeight: (
        personId: string,
        exerciseId: string,
      ) => Promise<ServiceResult<PersonMaxWeight | null>>;
      deletePersonMaxWeight: (
        personId: string,
        exerciseId: string,
      ) => Promise<ServiceResult<boolean>>;

      // Rotation
      createRotationSession: (
        input: CreateRotationSessionInput,
      ) => Promise<ServiceResult<{ sessionId: string }>>;
      getSessionAssignments: (sessionId: string) => Promise<ServiceResult<any>>;
      checkAndRotate: (
        participantId: string,
      ) => Promise<ServiceResult<{ rotated: boolean; nextExercise?: SessionParticipant }>>;

      // Seed database for testing
      seedDatabase: () => Promise<void>;
    };
  }
}

export {};