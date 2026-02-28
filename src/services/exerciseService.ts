/**
 * Exercise service - wraps exercise database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type { Exercise, CreateExerciseInput } from "../db/types.js";

export async function createExercise(
  input: CreateExerciseInput,
): Promise<ServiceResult<Exercise>> {
  try {
    const exercise = queries.createExercise(input);
    return { success: true, data: exercise };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to create exercise",
        details: error,
      },
    };
  }
}

export async function getAllExercises(): Promise<ServiceResult<Exercise[]>> {
  try {
    const exercises = queries.getAllExercises();
    return { success: true, data: exercises };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get all exercises",
        details: error,
      },
    };
  }
}

export async function getExercise(
  id: string,
): Promise<ServiceResult<Exercise | null>> {
  try {
    const exercise = queries.getExercise(id);
    return { success: true, data: exercise };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get exercise",
        details: error,
      },
    };
  }
}
