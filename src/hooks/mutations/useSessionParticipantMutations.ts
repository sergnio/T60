/**
 * React Query mutation hooks for session participant operations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type {
  SessionParticipant,
  CreateSessionParticipantInput,
  UpdateSessionParticipantInput,
} from "../../db/types.ts";

export function useCreateSessionParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSessionParticipantInput) => {
      const result = await window.database.createSessionParticipant(input);
      return result as SessionParticipant;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionParticipants.all(data.session_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.withParticipants(data.session_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.activeWithParticipants,
      });
    },
  });
}

export function useUpdateSessionParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSessionParticipantInput;
    }) => {
      const result = await window.database.updateSessionParticipant(id, input);
      return result as SessionParticipant | null;
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionParticipants.all(data.session_id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionParticipants.detail(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.workoutSessions.withParticipants(data.session_id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.workoutSessions.activeWithParticipants,
        });
      }
    },
  });
}

export function useDeleteSessionParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await window.database.deleteSessionParticipant(id);
      return result as boolean;
    },
    onSuccess: () => {
      // Invalidate all participant queries - we don't know which session without extra lookup
      queryClient.invalidateQueries({
        queryKey: ["sessionParticipants"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.activeWithParticipants,
      });
    },
  });
}