/**
 * React Query hooks for session participant operations
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type { SessionParticipant } from "../../db/types.ts";

export function useSessionParticipants(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessionParticipants.all(sessionId),
    queryFn: async () => {
      const result = await window.database.getSessionParticipants(sessionId);
      return result as SessionParticipant[];
    },
    enabled: !!sessionId,
  });
}

export function useActiveSessionParticipants(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessionParticipants.active(sessionId),
    queryFn: async () => {
      const result =
        await window.database.getActiveSessionParticipants(sessionId);
      return result as SessionParticipant[];
    },
    enabled: !!sessionId,
  });
}

export function useSessionParticipant(id: string) {
  return useQuery({
    queryKey: queryKeys.sessionParticipants.detail(id),
    queryFn: async () => {
      const result = await window.database.getSessionParticipant(id);
      return result as SessionParticipant | null;
    },
    enabled: !!id,
  });
}