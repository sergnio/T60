/**
 * Max Weight service - wraps person max weight database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type { PersonMaxWeight, WeightUnit } from "../db/types.js";

export async function setPersonMaxWeight(
  personId: string,
  exerciseId: string,
  maxWeight: number,
  weightUnit: WeightUnit,
): Promise<ServiceResult<PersonMaxWeight>> {
  console.log(
    "[maxWeightService:setPersonMaxWeight] Setting max weight for person:",
    personId,
    "exercise:",
    exerciseId,
    "weight:",
    maxWeight,
    weightUnit,
  );
  try {
    const result = queries.setPersonMaxWeight(
      personId,
      exerciseId,
      maxWeight,
      weightUnit,
    );
    console.log("[maxWeightService:setPersonMaxWeight] Success:", result.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("[maxWeightService:setPersonMaxWeight] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to set person max weight",
        details: error,
      },
    };
  }
}

export async function getPersonMaxWeights(
  personId: string,
): Promise<ServiceResult<PersonMaxWeight[]>> {
  console.log(
    "[maxWeightService:getPersonMaxWeights] Fetching max weights for person:",
    personId,
  );
  try {
    const maxWeights = queries.getPersonMaxWeights(personId);
    console.log(
      "[maxWeightService:getPersonMaxWeights] Found",
      maxWeights.length,
      "max weights",
    );
    return { success: true, data: maxWeights };
  } catch (error) {
    console.error("[maxWeightService:getPersonMaxWeights] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get person max weights",
        details: error,
      },
    };
  }
}

export async function getPersonMaxWeight(
  personId: string,
  exerciseId: string,
): Promise<ServiceResult<PersonMaxWeight | null>> {
  console.log(
    "[maxWeightService:getPersonMaxWeight] Fetching max weight for person:",
    personId,
    "exercise:",
    exerciseId,
  );
  try {
    const maxWeight = queries.getPersonMaxWeight(personId, exerciseId);
    console.log(
      "[maxWeightService:getPersonMaxWeight] Result:",
      maxWeight ? `${maxWeight.max_weight} ${maxWeight.weight_unit}` : "not found",
    );
    return { success: true, data: maxWeight };
  } catch (error) {
    console.error("[maxWeightService:getPersonMaxWeight] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get person max weight",
        details: error,
      },
    };
  }
}

export async function deletePersonMaxWeight(
  personId: string,
  exerciseId: string,
): Promise<ServiceResult<boolean>> {
  console.log(
    "[maxWeightService:deletePersonMaxWeight] Deleting max weight for person:",
    personId,
    "exercise:",
    exerciseId,
  );
  try {
    const result = queries.deletePersonMaxWeight(personId, exerciseId);
    console.log("[maxWeightService:deletePersonMaxWeight] Deleted:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("[maxWeightService:deletePersonMaxWeight] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to delete person max weight",
        details: error,
      },
    };
  }
}