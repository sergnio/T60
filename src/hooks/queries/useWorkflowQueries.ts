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
      return result.success ? result.data : null;
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
      return result.success ? result.data : null;
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
      return result.success ? result.data : null;
    },
    enabled: !!participantId,
  });
}