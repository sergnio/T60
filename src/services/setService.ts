/**
 * Set service - wraps set database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type { Set, CreateSetInput, UpdateSetInput } from "../db/types.js";

export async function createSet(
  input: CreateSetInput,
): Promise<ServiceResult<Set>> {
  try {
    const set = queries.createSet(input);
    return { success: true, data: set };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to create set",
        details: error,
      },
    };
  }
}

export async function getSet(id: string): Promise<ServiceResult<Set | null>> {
  try {
    const set = queries.getSet(id);
    return { success: true, data: set };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get set",
        details: error,
      },
    };
  }
}

export async function getSetsByParticipant(
  participantId: string,
): Promise<ServiceResult<Set[]>> {
  try {
    const sets = queries.getSetsByParticipant(participantId);
    return { success: true, data: sets };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get sets by participant",
        details: error,
      },
    };
  }
}

export async function updateSet(
  id: string,
  input: UpdateSetInput,
): Promise<ServiceResult<Set | null>> {
  try {
    const set = queries.updateSet(id, input);
    return { success: true, data: set };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to update set",
        details: error,
      },
    };
  }
}

export async function completeSet(
  id: string,
): Promise<ServiceResult<Set | null>> {
  try {
    const set = queries.completeSet(id);
    return { success: true, data: set };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to complete set",
        details: error,
      },
    };
  }
}

export async function deleteSet(id: string): Promise<ServiceResult<boolean>> {
  try {
    const result = queries.deleteSet(id);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to delete set",
        details: error,
      },
    };
  }
}