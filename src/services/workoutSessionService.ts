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
} from "../db/types.js";

export async function createWorkoutSession(
  input: CreateWorkoutSessionInput,
): Promise<ServiceResult<SessionWithParticipants>> {
  try {
    // Validate input
    if (!input.participantIds || input.participantIds.length === 0) {
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "At least one participant is required",
        },
      };
    }

    if (!input.exerciseName || input.exerciseName.trim().length === 0) {
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Exercise name is required",
        },
      };
    }

    const session = queries.createWorkoutSession(input);
    return { success: true, data: session };
  } catch (error) {
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
  try {
    const session = queries.getWorkoutSession(id);
    return { success: true, data: session };
  } catch (error) {
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
  try {
    const session = queries.getActiveWorkoutSession();
    return { success: true, data: session };
  } catch (error) {
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
  try {
    const sessions = queries.getAllWorkoutSessions();
    return { success: true, data: sessions };
  } catch (error) {
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
  try {
    const session = queries.updateWorkoutSession(id, input);
    return { success: true, data: session };
  } catch (error) {
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
  try {
    const session = queries.endWorkoutSession(id);
    return { success: true, data: session };
  } catch (error) {
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
  try {
    const result = queries.deleteWorkoutSession(id);
    return { success: true, data: result };
  } catch (error) {
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