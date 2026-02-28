/**
 * Workflow service - wraps joined queries and complex workflows
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type {
  ParticipantWithSets,
  SessionWithParticipants,
} from "../db/types.js";

export async function getParticipantWithSets(
  participantId: string,
): Promise<ServiceResult<ParticipantWithSets | null>> {
  console.log("[workflowService:getParticipantWithSets] Fetching participant with sets:", participantId);
  try {
    const participant = queries.getParticipantWithSets(participantId);
    console.log("[workflowService:getParticipantWithSets] Result:", participant ? `found (${participant.sets.length} sets)` : "not found");
    return { success: true, data: participant };
  } catch (error) {
    console.error("[workflowService:getParticipantWithSets] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get participant with sets",
        details: error,
      },
    };
  }
}

export async function getSessionWithParticipants(
  sessionId: string,
): Promise<ServiceResult<SessionWithParticipants | null>> {
  console.log("[workflowService:getSessionWithParticipants] Fetching session with participants:", sessionId);
  try {
    const session = queries.getSessionWithParticipants(sessionId);
    console.log("[workflowService:getSessionWithParticipants] Result:", session ? `found (${session.participants.length} participants)` : "not found");
    return { success: true, data: session };
  } catch (error) {
    console.error("[workflowService:getSessionWithParticipants] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get session with participants",
        details: error,
      },
    };
  }
}

export async function getActiveSessionWithParticipants(): Promise<
  ServiceResult<SessionWithParticipants | null>
> {
  console.log("[workflowService:getActiveSessionWithParticipants] Fetching active session with participants");
  try {
    const session = queries.getActiveSessionWithParticipants();
    console.log("[workflowService:getActiveSessionWithParticipants] Result:", session ? `found (${session.participants.length} participants)` : "no active session");
    return { success: true, data: session };
  } catch (error) {
    console.error("[workflowService:getActiveSessionWithParticipants] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get active session with participants",
        details: error,
      },
    };
  }
}
