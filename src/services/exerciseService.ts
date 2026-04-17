/**
 * Exercise service - wraps exercise database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type { Exercise, CreateExerciseInput, UpdateExerciseInput } from "../db/types.js";

export async function createExercise(
  input: CreateExerciseInput,
): Promise<ServiceResult<Exercise>> {
  console.log("[exerciseService:createExercise] Creating exercise:", input.name);
  try {
    const exercise = queries.createExercise(input);
    console.log("[exerciseService:createExercise] Created exercise:", exercise.id);
    return { success: true, data: exercise };
  } catch (error) {
    console.error("[exerciseService:createExercise] Failed:", error);
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
  console.log("[exerciseService:getAllExercises] Fetching all exercises");
  try {
    const exercises = queries.getAllExercises();
    console.log("[exerciseService:getAllExercises] Found", exercises.length, "exercises");
    return { success: true, data: exercises };
  } catch (error) {
    console.error("[exerciseService:getAllExercises] Failed:", error);
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

export async function updateExercise(
  id: string,
  input: UpdateExerciseInput,
): Promise<ServiceResult<Exercise | null>> {
  console.log("[exerciseService:updateExercise] Updating exercise:", id);
  try {
    const exercise = queries.updateExercise(id, input);
    console.log("[exerciseService:updateExercise] Updated:", exercise ? "success" : "not found");
    return { success: true, data: exercise };
  } catch (error) {
    console.error("[exerciseService:updateExercise] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to update exercise",
        details: error,
      },
    };
  }
}

export async function getExercise(
  id: string,
): Promise<ServiceResult<Exercise | null>> {
  console.log("[exerciseService:getExercise] Fetching exercise:", id);
  try {
    const exercise = queries.getExercise(id);
    console.log("[exerciseService:getExercise] Result:", exercise ? "found" : "not found");
    return { success: true, data: exercise };
  } catch (error) {
    console.error("[exerciseService:getExercise] Failed:", error);
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
