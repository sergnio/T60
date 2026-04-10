import { contextBridge, ipcRenderer } from "electron";
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
} from "../db/types.js";

/**
 * Database API exposed to the renderer process
 */
const databaseAPI = {
  // Exercises
  createExercise: (input: CreateExerciseInput) =>
    ipcRenderer.invoke("db:createExercise", input),
  getAllExercises: () => ipcRenderer.invoke("db:getAllExercises"),
  updateExercise: (id: string, input: UpdateExerciseInput) =>
    ipcRenderer.invoke("db:updateExercise", id, input),

  // People
  createPerson: (input: CreatePersonInput) =>
    ipcRenderer.invoke("db:createPerson", input),
  getPerson: (id: string) => ipcRenderer.invoke("db:getPerson", id),
  getAllPeople: () => ipcRenderer.invoke("db:getAllPeople"),
  updatePerson: (id: string, input: UpdatePersonInput) =>
    ipcRenderer.invoke("db:updatePerson", id, input),
  deletePerson: (id: string) => ipcRenderer.invoke("db:deletePerson", id),

  // Workout Sessions
  createWorkoutSession: (input: CreateWorkoutSessionInput) =>
    ipcRenderer.invoke("db:createWorkoutSession", input),
  getWorkoutSession: (id: string) =>
    ipcRenderer.invoke("db:getWorkoutSession", id),
  getActiveWorkoutSession: () =>
    ipcRenderer.invoke("db:getActiveWorkoutSession"),
  getAllWorkoutSessions: () => ipcRenderer.invoke("db:getAllWorkoutSessions"),
  updateWorkoutSession: (id: string, input: UpdateWorkoutSessionInput) =>
    ipcRenderer.invoke("db:updateWorkoutSession", id, input),
  endWorkoutSession: (id: string) =>
    ipcRenderer.invoke("db:endWorkoutSession", id),
  deleteWorkoutSession: (id: string) =>
    ipcRenderer.invoke("db:deleteWorkoutSession", id),

  // Session Participants
  createSessionParticipant: (input: CreateSessionParticipantInput) =>
    ipcRenderer.invoke("db:createSessionParticipant", input),
  getSessionParticipant: (id: string) =>
    ipcRenderer.invoke("db:getSessionParticipant", id),
  getSessionParticipants: (sessionId: string) =>
    ipcRenderer.invoke("db:getSessionParticipants", sessionId),
  getActiveSessionParticipants: (sessionId: string) =>
    ipcRenderer.invoke("db:getActiveSessionParticipants", sessionId),
  updateSessionParticipant: (
    id: string,
    input: UpdateSessionParticipantInput,
  ) => ipcRenderer.invoke("db:updateSessionParticipant", id, input),
  deleteSessionParticipant: (id: string) =>
    ipcRenderer.invoke("db:deleteSessionParticipant", id),

  // Sets
  createSet: (input: CreateSetInput) =>
    ipcRenderer.invoke("db:createSet", input),
  getSet: (id: string) => ipcRenderer.invoke("db:getSet", id),
  getSetsByParticipant: (participantId: string) =>
    ipcRenderer.invoke("db:getSetsByParticipant", participantId),
  updateSet: (id: string, input: UpdateSetInput) =>
    ipcRenderer.invoke("db:updateSet", id, input),
  completeSet: (id: string) => ipcRenderer.invoke("db:completeSet", id),
  deleteSet: (id: string) => ipcRenderer.invoke("db:deleteSet", id),

  // Joined Queries
  getParticipantWithSets: (participantId: string) =>
    ipcRenderer.invoke("db:getParticipantWithSets", participantId),
  getSessionWithParticipants: (sessionId: string) =>
    ipcRenderer.invoke("db:getSessionWithParticipants", sessionId),
  getActiveSessionWithParticipants: () =>
    ipcRenderer.invoke("db:getActiveSessionWithParticipants"),

  // Person Max Weights
  setPersonMaxWeight: (
    personId: string,
    exerciseId: string,
    maxWeight: number,
    weightUnit: WeightUnit,
  ) =>
    ipcRenderer.invoke(
      "db:setPersonMaxWeight",
      personId,
      exerciseId,
      maxWeight,
      weightUnit,
    ),
  getPersonMaxWeights: (personId: string) =>
    ipcRenderer.invoke("db:getPersonMaxWeights", personId),
  getPersonMaxWeight: (personId: string, exerciseId: string) =>
    ipcRenderer.invoke("db:getPersonMaxWeight", personId, exerciseId),
  deletePersonMaxWeight: (personId: string, exerciseId: string) =>
    ipcRenderer.invoke("db:deletePersonMaxWeight", personId, exerciseId),

  // Rotation (multi-exercise sessions)
  createRotationSession: (input: CreateRotationSessionInput) =>
    ipcRenderer.invoke("db:createRotationSession", input),
  getSessionAssignments: (sessionId: string) =>
    ipcRenderer.invoke("db:getSessionAssignments", sessionId),
  checkAndRotate: (participantId: string) =>
    ipcRenderer.invoke("db:checkAndRotate", participantId),

  // Seed database for testing
  seedDatabase: () => ipcRenderer.invoke("db:seedDatabase"),
};

// Expose the database API to the renderer process
contextBridge.exposeInMainWorld("database", databaseAPI);

// Type definitions for window.database
declare global {
  interface Window {
    database: typeof databaseAPI;
  }
}
