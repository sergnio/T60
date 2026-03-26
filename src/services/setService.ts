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

    // Check if ALL active participants across ALL exercises have completed ALL their sets
    if (set) {
      const participant = queries.getSessionParticipant(set.participant_id);
      if (participant) {
        const allParticipants = queries.getSessionParticipants(participant.session_id);
        const activeParticipants = allParticipants.filter((p) => p.status === "active");

        const allCompletedAllSets = activeParticipants.every((p) => {
          const sets = queries.getSetsByParticipant(p.id);
          return sets.length > 0 && sets.every((s) => s.completed);
        });

        console.log(
          `[setService:completeSet] All active participants in session completed ALL sets:`,
          allCompletedAllSets
        );

        if (allCompletedAllSets) {
          console.log(
            `[setService:completeSet] All sets complete - triggering session-wide rotation`
          );
          const rotationResult = await rotationService.rotateAllParticipantsInSession(
            participant.session_id
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
