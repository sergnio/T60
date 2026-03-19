/**
 * Set service - wraps set database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type { Set, CreateSetInput, UpdateSetInput } from "../db/types.js";
import * as rotationService from "./rotationService.js";

export async function createSet(
  input: CreateSetInput,
): Promise<ServiceResult<Set>> {
  console.log(
    "[setService:createSet] Creating set for participant:",
    input.participant_id,
    "index:",
    input.set_index,
    "weight:",
    input.weight,
    "reps:",
    input.reps,
  );
  try {
    const set = queries.createSet(input);
    console.log("[setService:createSet] Created set:", set.id);
    return { success: true, data: set };
  } catch (error) {
    console.error("[setService:createSet] Failed:", error);
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
  console.log("[setService:getSet] Fetching set:", id);
  try {
    const set = queries.getSet(id);
    console.log("[setService:getSet] Result:", set ? "found" : "not found");
    return { success: true, data: set };
  } catch (error) {
    console.error("[setService:getSet] Failed:", error);
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
  console.log(
    "[setService:getSetsByParticipant] Fetching sets for participant:",
    participantId,
  );
  try {
    const sets = queries.getSetsByParticipant(participantId);
    console.log("[setService:getSetsByParticipant] Found", sets.length, "sets");
    return { success: true, data: sets };
  } catch (error) {
    console.error("[setService:getSetsByParticipant] Failed:", error);
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
    console.log(
      "[setService:updateSet] Updated:",
      set ? "success" : "not found",
    );
    return { success: true, data: set };
  } catch (error) {
    console.error("[setService:updateSet] Failed:", error);
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
    console.log(
      "[setService:completeSet] Completed:",
      set ? "success" : "not found",
    );

    // Check if all participants at this exercise have completed the current set
    if (set) {
      const participant = queries.getSessionParticipant(set.participant_id);
      if (participant && participant.exercise_id) {
        // Get all active participants at this exercise
        const allParticipants = queries.getSessionParticipants(participant.session_id);
        const participantsAtExercise = allParticipants.filter(
          (p) => p.exercise_id === participant.exercise_id && p.status === "active"
        );

        // Check if all participants at this exercise have completed the current set
        const allCompletedCurrentSet = participantsAtExercise.every((p) => {
          const sets = queries.getSetsByParticipant(p.id);
          const currentSet = sets[set.set_index];
          return currentSet?.completed;
        });

        console.log(
          `[setService:completeSet] All participants at exercise completed set ${set.set_index}:`,
          allCompletedCurrentSet
        );

        // If all participants completed the current set, rotate everyone to next exercise
        if (allCompletedCurrentSet) {
          console.log(
            `[setService:completeSet] Triggering rotation for all participants at exercise ${participant.exercise_id}`
          );
          const rotationResult = await rotationService.rotateAllParticipantsAtExercise(
            participant.session_id,
            participant.exercise_id
          );

          if (rotationResult.success && rotationResult.data.rotated) {
            console.log(
              `[setService:completeSet] Rotated ${rotationResult.data.participantCount} participants`
            );
          }
        }
      }
    }

    return { success: true, data: set };
  } catch (error) {
    console.error("[setService:completeSet] Failed:", error);
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
  console.log("[setService:deleteSet] Deleting set:", id);
  try {
    const result = queries.deleteSet(id);
    console.log("[setService:deleteSet] Deleted:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("[setService:deleteSet] Failed:", error);
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
