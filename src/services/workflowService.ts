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
  try {
    const participant = queries.getParticipantWithSets(participantId);
    return { success: true, data: participant };
  } catch (error) {
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
  try {
    const session = queries.getSessionWithParticipants(sessionId);
    return { success: true, data: session };
  } catch (error) {
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
  try {
    console.log("Getting active session with participants");
    const session = queries.getActiveSessionWithParticipants();
    return { success: true, data: session };
  } catch (error) {
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
