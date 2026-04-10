/**
 * Workout session service - wraps session database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type {
  WorkoutSession,
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
  SessionWithParticipants,
  SetConfig,
  ExerciseStation,
} from "../db/types.js";

import { calculateLoadableWeight } from "../utils/weightCalculation.js";

/**
 * Calculates set weights based on max weight percentage
 * Set 1: 50%, Set 2: 75%, Sets 3-5: 85%
 * Ensures weights can actually be loaded with available plates
 */
function calculateSetWeights(maxWeight: number, barWeight: number): number[] {
  const percentages = [0.5, 0.75, 0.85, 0.85, 0.85];
  return percentages.map((percentage) =>
    calculateLoadableWeight(maxWeight * percentage, barWeight),
  );
}

/**
 * Generates sets config based on max weight and the exercise's bar weight.
 * Throws if max weight is not found.
 */
function generateSetsConfig(personId: string, exerciseId: string): SetConfig[] {
  const maxWeightRecord = queries.getPersonMaxWeight(personId, exerciseId);

  if (!maxWeightRecord) {
    throw new Error(`MAX_WEIGHT_NOT_FOUND:${personId}:${exerciseId}`);
  }

  // Fetch the exercise's bar weight — NULL means no bar (0), positive means that bar weight
  const exercise = queries.getExercise(exerciseId);
  const barWeight = exercise?.bar_weight ?? 0;

  const weights = calculateSetWeights(maxWeightRecord.max_weight, barWeight);
  console.log(
    `[sessionService] Using max weight ${maxWeightRecord.max_weight} ${maxWeightRecord.weight_unit}, bar weight ${barWeight} for person ${personId}, exercise ${exerciseId}`,
  );

  return [
    { weight: weights[0], reps: 10 },
    { weight: weights[1], reps: 5 },
    { weight: weights[2], reps: 5 },
    { weight: weights[3], reps: 5 },
    { weight: weights[4], reps: 5 },
  ];
}

export async function createWorkoutSession(
  input: CreateWorkoutSessionInput,
): Promise<ServiceResult<SessionWithParticipants>> {
  console.log(
    "[sessionService:createWorkoutSession] Creating session:",
    input.name,
    "with",
    input.stations?.length,
    "stations",
  );
  try {
    // Validate input
    if (!input.stations || input.stations.length === 0) {
      console.warn(
        "[sessionService:createWorkoutSession] Validation failed: no stations",
      );
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "At least one station is required",
        },
      };
    }

    if (
      input.stations.some((s) => s.sets !== undefined && s.sets.length === 0)
    ) {
      console.warn(
        "[sessionService:createWorkoutSession] Validation failed: station sets array is empty",
      );
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Each station's sets array must not be empty if provided",
        },
      };
    }

    // Detect rotation scenario: multiple exercises means rotation workout
    const allExerciseIds = [
      ...new Set(input.stations.map((s) => s.exerciseId)),
    ];
    const isRotationWorkout = allExerciseIds.length > 1;

    if (isRotationWorkout) {
      console.log(
        "[sessionService:createWorkoutSession] Detected rotation workout - creating ALL participant records for ALL exercises",
      );

      // For rotation workouts, create participant records for ALL people at ALL exercises
      // Extract all unique participants and exercises
      const allParticipantIds = [
        ...new Set(input.stations.flatMap((s) => s.participantIds)),
      ];

      // Build a map of which exercise each participant starts at
      const participantStartingExercise = new Map<string, string>();
      for (const station of input.stations) {
        for (const participantId of station.participantIds) {
          if (!participantStartingExercise.has(participantId)) {
            participantStartingExercise.set(participantId, station.exerciseId);
          }
        }
      }

      // Create processed stations for ALL combinations (person × exercise)
      const processedStations: ExerciseStation[] = [];

      for (const participantId of allParticipantIds) {
        const startingExerciseId =
          participantStartingExercise.get(participantId)!;

        for (const exerciseId of allExerciseIds) {
          processedStations.push({
            exerciseId,
            participantIds: [participantId],
            sets: generateSetsConfig(participantId, exerciseId),
            // Mark if this is the starting exercise for this participant
            isStartingExercise: exerciseId === startingExerciseId,
          });
        }
      }

      const processedInput: CreateWorkoutSessionInput = {
        ...input,
        stations: processedStations,
      };

      const session = queries.createWorkoutSession(processedInput);

      // Create rotation config
      queries.createRotationConfig(session.id, allExerciseIds, 2);

      console.log(
        "[sessionService:createWorkoutSession] Created rotation session:",
        session.id,
        "with",
        allParticipantIds.length,
        "participants and",
        allExerciseIds.length,
        "exercises",
      );
      return { success: true, data: session };
    } else {
      // Non-rotation workout: process normally (one exercise, multiple participants)
      const processedStations: ExerciseStation[] = [];

      for (const station of input.stations) {
        for (const participantId of station.participantIds) {
          processedStations.push({
            exerciseId: station.exerciseId,
            participantIds: [participantId],
            sets:
              station.sets ??
              generateSetsConfig(participantId, station.exerciseId),
          });
        }
      }

      const processedInput: CreateWorkoutSessionInput = {
        ...input,
        stations: processedStations,
      };

      const session = queries.createWorkoutSession(processedInput);
      console.log(
        "[sessionService:createWorkoutSession] Created session:",
        session.id,
      );
      return { success: true, data: session };
    }
  } catch (error) {
    console.error("[sessionService:createWorkoutSession] Failed:", error);

    // Check if it's a max weight not found error
    if (
      error instanceof Error &&
      error.message.startsWith("MAX_WEIGHT_NOT_FOUND:")
    ) {
      const [, personId, exerciseId] = error.message.split(":");
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Max weight not found for participant",
          details: { personId, exerciseId },
        },
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to create workout session",
        details: error,
      },
    };
  }
}

export async function getWorkoutSession(
  id: string,
): Promise<ServiceResult<WorkoutSession | null>> {
  console.log("[sessionService:getWorkoutSession] Fetching session:", id);
  try {
    const session = queries.getWorkoutSession(id);
    console.log(
      "[sessionService:getWorkoutSession] Result:",
      session ? "found" : "not found",
    );
    return { success: true, data: session };
  } catch (error) {
    console.error("[sessionService:getWorkoutSession] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get workout session",
        details: error,
      },
    };
  }
}

export async function getActiveWorkoutSession(): Promise<
  ServiceResult<WorkoutSession | null>
> {
  console.log(
    "[sessionService:getActiveWorkoutSession] Fetching active session",
  );
  try {
    const session = queries.getActiveWorkoutSession();
    console.log(
      "[sessionService:getActiveWorkoutSession] Result:",
      session ? `found (${session.id})` : "none active",
    );
    return { success: true, data: session };
  } catch (error) {
    console.error("[sessionService:getActiveWorkoutSession] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get active workout session",
        details: error,
      },
    };
  }
}

export async function getAllWorkoutSessions(): Promise<
  ServiceResult<WorkoutSession[]>
> {
  console.log("[sessionService:getAllWorkoutSessions] Fetching all sessions");
  try {
    const sessions = queries.getAllWorkoutSessions();
    console.log(
      "[sessionService:getAllWorkoutSessions] Found",
      sessions.length,
      "sessions",
    );
    return { success: true, data: sessions };
  } catch (error) {
    console.error("[sessionService:getAllWorkoutSessions] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get all workout sessions",
        details: error,
      },
    };
  }
}

export async function updateWorkoutSession(
  id: string,
  input: UpdateWorkoutSessionInput,
): Promise<ServiceResult<WorkoutSession | null>> {
  console.log(
    "[sessionService:updateWorkoutSession] Updating session:",
    id,
    "with:",
    JSON.stringify(input),
  );
  try {
    const session = queries.updateWorkoutSession(id, input);
    console.log(
      "[sessionService:updateWorkoutSession] Updated:",
      session ? "success" : "not found",
    );
    return { success: true, data: session };
  } catch (error) {
    console.error("[sessionService:updateWorkoutSession] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to update workout session",
        details: error,
      },
    };
  }
}

export async function endWorkoutSession(
  id: string,
): Promise<ServiceResult<WorkoutSession | null>> {
  console.log("[sessionService:endWorkoutSession] Ending session:", id);
  try {
    const session = queries.endWorkoutSession(id);
    console.log(
      "[sessionService:endWorkoutSession] Ended:",
      session ? "success" : "not found",
    );
    return { success: true, data: session };
  } catch (error) {
    console.error("[sessionService:endWorkoutSession] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to end workout session",
        details: error,
      },
    };
  }
}

export async function deleteWorkoutSession(
  id: string,
): Promise<ServiceResult<boolean>> {
  console.log("[sessionService:deleteWorkoutSession] Deleting session:", id);
  try {
    const result = queries.deleteWorkoutSession(id);
    console.log("[sessionService:deleteWorkoutSession] Deleted:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("[sessionService:deleteWorkoutSession] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to delete workout session",
        details: error,
      },
    };
  }
}
