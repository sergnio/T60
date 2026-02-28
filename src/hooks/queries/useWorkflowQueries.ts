/**
 * React Query hooks for workflow/joined queries
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";

export function useActiveSessionWithParticipants() {
  return useQuery({
    queryKey: queryKeys.workoutSessions.activeWithParticipants,
    queryFn: async () => {
      const result = await window.database.getActiveSessionWithParticipants();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    refetchInterval: 5000, // Poll every 5s for live updates
  });
}

export function useSessionWithParticipants(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.workoutSessions.withParticipants(sessionId),
    queryFn: async () => {
      const result =
        await window.database.getSessionWithParticipants(sessionId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!sessionId,
  });
}

export function useParticipantWithSets(participantId: string) {
  return useQuery({
    queryKey: queryKeys.sessionParticipants.withSets(participantId),
    queryFn: async () => {
      const result =
        await window.database.getParticipantWithSets(participantId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!participantId,
  });
}