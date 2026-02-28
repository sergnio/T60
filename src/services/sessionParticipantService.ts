/**
 * Session participant service - wraps participant database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type {
  SessionParticipant,
  CreateSessionParticipantInput,
  UpdateSessionParticipantInput,
} from "../db/types.js";

export async function createSessionParticipant(
  input: CreateSessionParticipantInput,
): Promise<ServiceResult<SessionParticipant>> {
  console.log("[participantService:createSessionParticipant] Creating participant for session:", input.session_id, "person:", input.person_id, "exercise:", input.exercise_name);
  try {
    const participant = queries.createSessionParticipant(input);
    console.log("[participantService:createSessionParticipant] Created participant:", participant.id);
    return { success: true, data: participant };
  } catch (error) {
    console.error("[participantService:createSessionParticipant] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to create session participant",
        details: error,
      },
    };
  }
}

export async function getSessionParticipant(
  id: string,
): Promise<ServiceResult<SessionParticipant | null>> {
  console.log("[participantService:getSessionParticipant] Fetching participant:", id);
  try {
    const participant = queries.getSessionParticipant(id);
    console.log("[participantService:getSessionParticipant] Result:", participant ? "found" : "not found");
    return { success: true, data: participant };
  } catch (error) {
    console.error("[participantService:getSessionParticipant] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get session participant",
        details: error,
      },
    };
  }
}

export async function getSessionParticipants(
  sessionId: string,
): Promise<ServiceResult<SessionParticipant[]>> {
  console.log("[participantService:getSessionParticipants] Fetching participants for session:", sessionId);
  try {
    const participants = queries.getSessionParticipants(sessionId);
    console.log("[participantService:getSessionParticipants] Found", participants.length, "participants");
    return { success: true, data: participants };
  } catch (error) {
    console.error("[participantService:getSessionParticipants] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get session participants",
        details: error,
      },
    };
  }
}

export async function getActiveSessionParticipants(
  sessionId: string,
): Promise<ServiceResult<SessionParticipant[]>> {
  console.log("[participantService:getActiveSessionParticipants] Fetching active participants for session:", sessionId);
  try {
    const participants = queries.getActiveSessionParticipants(sessionId);
    console.log("[participantService:getActiveSessionParticipants] Found", participants.length, "active participants");
    return { success: true, data: participants };
  } catch (error) {
    console.error("[participantService:getActiveSessionParticipants] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get active session participants",
        details: error,
      },
    };
  }
}

export async function updateSessionParticipant(
  id: string,
  input: UpdateSessionParticipantInput,
): Promise<ServiceResult<SessionParticipant | null>> {
  console.log("[participantService:updateSessionParticipant] Updating participant:", id, "with:", JSON.stringify(input));
  try {
    const participant = queries.updateSessionParticipant(id, input);
    console.log("[participantService:updateSessionParticipant] Updated:", participant ? "success" : "not found");
    return { success: true, data: participant };
  } catch (error) {
    console.error("[participantService:updateSessionParticipant] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to update session participant",
        details: error,
      },
    };
  }
}

export async function deleteSessionParticipant(
  id: string,
): Promise<ServiceResult<boolean>> {
  console.log("[participantService:deleteSessionParticipant] Deleting participant:", id);
  try {
    const result = queries.deleteSessionParticipant(id);
    console.log("[participantService:deleteSessionParticipant] Deleted:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("[participantService:deleteSessionParticipant] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to delete session participant",
        details: error,
      },
    };
  }
}